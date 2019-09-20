import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    AsyncStorage
} from 'react-native';
import getEnvVars from '../environment';
import {FloatingAction} from "react-native-floating-action";
import {Ionicons} from "@expo/vector-icons";
import HomeHeader from './HomeHeader';

const vars = getEnvVars();

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
            user: null
        };
        this.retrieveUser = this.retrieveUser.bind(this);
        this.storeUser = this.storeUser.bind(this);
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

    componentWillMount() {
        this.retrieveUser();
    }

    /**
     * Method that retrieves the user information from local storage
     * @returns {Promise<void>}
     */
    retrieveUser = async () => {
        try {
            let user = await AsyncStorage.getItem('USER');
            if (user) {
                user = JSON.parse(user);
                this.setState({user});
                this.props.navigation.setParams({user});
            } else {
                let user = {
                    NAME: '',
                    SEX: '',
                    SCORE: 0
                };
                fetch(`${vars.apiUrl}/user`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(user),
                }).then((data) => {
                    return JSON.parse(data);
                }).then((data) => {
                    user.ID = data.ID;
                    this.storeUser(user);
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
    storeUser = async (user) => {
        try {
            await AsyncStorage.setItem('USER', JSON.stringify(user));
        } catch (error) {
            console.warn(error);
        }
    };

    NoInfoModule = () => (
        <View style={styles.noInfoContainer}>
            <Ionicons name={Platform.OS === 'ios' ? 'ios-information-circle' : 'md-information-circle'} size={120}
                      color={'#888'}/>
            <Text style={styles.informationText}>
                No hay información disponible
            </Text>
        </View>
    );

    render() {
        return (
            <View style={styles.container}>
                {
                    this.NoInfoModule()
                }
                <FloatingAction
                    actions={actions} color='#00B050'
                    onPressItem={(name) => {
                        if (name === 'bt_addmeasurement') {
                            this.props.navigation.navigate('BTManagement', {user: this.state.user})
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
    noInfoContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    informationText: {
        fontSize: 20,
        color: '#888',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
