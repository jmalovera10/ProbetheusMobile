import React from 'react';
import {Platform, View, StyleSheet, AsyncStorage, Image, Text, RefreshControl, FlatList, ToastAndroid} from 'react-native';
import Constants from 'expo-constants';
import {ListItem} from "react-native-elements";
import {Ionicons} from "@expo/vector-icons";

export default class MeasurementsScreen extends React.Component {

    static navigationOptions = {
        title: 'Mis mediciones',
        headerStyle: {
            backgroundColor: '#00B050',
        },
        headerTitleStyle: {
            color: '#FFFFFF',
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            measurements: [],
            refreshing: false
        };
        this.retrieveMyMeasurements = this.retrieveMyMeasurements.bind(this);
    }

    componentDidMount() {
        if (this.state.measurements.length === 0) {
            this.retrieveMyMeasurements()
                .catch((error) => {
                    if(Platform.OS === 'android'){
                        ToastAndroid.showWithGravity('No fue posible conectarse a internet.',ToastAndroid.SHORT, ToastAndroid.CENTER);
                    }
                });
        }
    }

    /**
     * Method that retrieves
     * @returns {Promise<void>}
     */
    retrieveMyMeasurements = async () => {
        let userId = await AsyncStorage.getItem('USER_ID');
        if (userId) {
            fetch(`${Constants.manifest.extra.production.serverIP}/API/measurements/user/${userId}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                }
            }).then((data) => {
                return data.json();
            }).then((data) => {
                this.setState({measurements: data});
            })
        }
    };

    keyExtractor = (item, index) => index.toString();

    renderItem = ({item}) => {
        let measurementTime = new Date(item.MEASUREMENT_TIME);
        return (
            <ListItem
                title={`${item.SENSOR_NAME}: ${item.VALUE_MEASURED} ${item.UNITS}`}
                subtitle={
                    `${measurementTime.getUTCDate()}/${measurementTime.getUTCMonth()}/${measurementTime.getFullYear()} - ${measurementTime.getHours()}:${measurementTime.getMinutes()}`
                }
                rightAvatar={<Image style={styles.coinImage} source={require('../assets/images/coin.png')}/>}
                rightTitle={'+50'}
                bottomDivider
                chevron
            />
        );
    };

    /**
     * Module that is displayed when there is no information to show to the user
     * @returns {*}
     * @constructor
     */
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
                    this.state.measurements.length === 0 ?
                        this.NoInfoModule()
                        : <FlatList
                            keyExtractor={this.keyExtractor}
                            data={this.state.measurements}
                            renderItem={this.renderItem}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={
                                        () => {
                                            this.setState({refreshing:true});
                                            this.retrieveMyMeasurements()
                                                .then(()=>{
                                                    this.setState({refreshing:false})
                                                })
                                                .catch((error)=>{

                                                })
                                        }
                                    }
                                />}
                        />
                }

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    coinImage: {
        width: 30,
        height: 30
    }, noInfoContainer: {
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
