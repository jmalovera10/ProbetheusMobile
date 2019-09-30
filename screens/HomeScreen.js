import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    AsyncStorage
} from 'react-native';
import {FloatingAction} from "react-native-floating-action";
import {Ionicons} from "@expo/vector-icons";
import MapView from 'react-native-maps';
import Constants from 'expo-constants';
import HomeHeader from './HomeHeader';

const actions = [
    {
        text: 'Nueva Medición',
        icon: require('../assets/images/add-square-button.png'),
        name: 'bt_addmeasurement',
        position: 1,
        color: '#00B050'
    }
];

export default class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            isMapReady: false
        };
        this.retrieveUser = this.retrieveUser.bind(this);
        this.storeUserId = this.storeUserId.bind(this);
        this.onMapLayout = this.onMapLayout.bind(this);
    };

    static navigationOptions = ({navigation}) => {
        const {params = {}} = navigation.state;
        return (
            {
                headerTitle: <HomeHeader user={params.user}/>,
                headerStyle: {
                    backgroundColor: '#00B050',
                },
                headerTitleStyle: {
                    color: '#FFFFFF',
                }
            }
        )
    };

    componentDidMount() {
        this.retrieveUser();
    }

    /**
     * Method that retrieves the user information from local storage
     * @returns {Promise<void>}
     */
    retrieveUser = async () => {
        try {
            let userId = await AsyncStorage.getItem('USER_ID');
            if (userId) {
                fetch(`${Constants.manifest.extra.production.serverIP}/API/user/${userId}`, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    }
                }).then((data) => {
                    return data.json();
                }).then((data) => {
                    this.setState({user: data});
                    this.props.navigation.setParams({user: data});
                })
            } else {
                let user = {
                    NAME: '',
                    SEX: '',
                    SCORE: 0
                };
                fetch(`${Constants.manifest.extra.production.serverIP}/API/user`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(user),
                }).then((data) => {
                    return data.json();
                }).then((data) => {
                    user.ID = data.ID;
                    this.storeUserId(user.ID);
                    this.setState({user});
                    this.props.navigation.setParams({user});
                })
            }

        } catch (error) {
            console.warn(error);
        }
    };

    /**
     * Method that stores a user information from local storage
     * @returns {Promise<void>}
     */
    storeUserId = async (userId) => {
        try {
            await AsyncStorage.setItem('USER_ID', userId);
        } catch (error) {
            console.warn(error);
        }
    };

    onMapLayout = () => {
        this.setState({isMapReady: true})
    };

    render() {
        return (
            <View style={styles.container}>
                <MapView
                    initialRegion={
                        {
                            latitude: 4.928153,
                            longitude: -74.051225,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }
                    }
                    onMapReady={this.onMapLayout}
                    style={styles.map}
                />
                <FloatingAction
                    actions={actions} color='#00B050'
                    onPressItem={(name) => {
                        if (name === 'bt_addmeasurement') {
                            this.props.navigation.navigate('BTManagement', {ID_USER: this.state.user.ID})
                        }
                    }}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    informationText: {
        fontSize: 20,
        color: '#888',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
