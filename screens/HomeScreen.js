import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    ToastAndroid
} from 'react-native';
import {FloatingAction} from "react-native-floating-action";
import MapView, {Marker, Callout} from 'react-native-maps';
import Constants from 'expo-constants';
import HomeHeader from './HomeHeader';
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";

const actions = [
    {
        text: 'Nueva Medición',
        icon: require('../assets/images/add-square-button.png'),
        name: 'bt_addmeasurement',
        position: 1,
        color: '#00B050'
    },
    {
        text: 'Actualizar Mapa',
        icon: require('../assets/images/update-map.png'),
        name: 'bt_updatemap',
        position: 1,
        color: '#00a6ed'
    }
];

export default class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            isMapReady: false,
            measurements: [],
            location: null
        };
        this.retrieveUser = this.retrieveUser.bind(this);
        this.storeUserId = this.storeUserId.bind(this);
        this.getRecentMeasurements = this.getRecentMeasurements.bind(this);
        this.getLocationAsync = this.getLocationAsync.bind(this);
        this.onMapLayout = this.onMapLayout.bind(this);
        this.renderMarkers = this.renderMarkers.bind(this);
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
        this.askPermissions();
        this.getLocationAsync();
        this.retrieveUser();
        this.getRecentMeasurements();
    }

    askPermissions = async () => {
        const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            finalStatus = status;
        }
        return finalStatus === 'granted';
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
            if(Platform.OS === 'android'){
                ToastAndroid.showWithGravity('No fue posible conectarse a internet.',ToastAndroid.SHORT, ToastAndroid.CENTER);
            }
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
            if(Platform.OS === 'android'){
                ToastAndroid.showWithGravity('No fue posible encontrar el id de usuario.',ToastAndroid.SHORT, ToastAndroid.CENTER);
            }
        }
    };

    /**
     * Method that retrieves the 20 last measurements made by the community
     */
    getRecentMeasurements() {
        fetch(`${Constants.manifest.extra.production.serverIP}/API/measurements`, {
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

    /**
     * Method that requests the current user location
     * @returns {Promise<LocationData>}
     */
    getLocationAsync = async () => {
        let {status} = await Permissions.askAsync(Permissions.LOCATION);
        if (status === 'granted') {
            let location = await Location.getCurrentPositionAsync({});
            this.setState({location});
            return location;
        }
    };

    onMapLayout = () => {
        this.setState({isMapReady: true})
    };

    /**
     * Method thar renders all measurements obtained from request as Markers
     * @returns {*[]}
     */
    renderMarkers = () => {
        return this.state.measurements.map((measurement) => {
            let measurementTime = new Date(measurement.MEASUREMENT_TIME);
            let dangerValue = false;
            if (measurement.MIN_VALUE && measurement.MIN_VALUE > measurement.VALUE_MEASURED) {
                dangerValue = true;
            } else if (measurement.MAX_VALUE && measurement.MAX_VALUE < measurement.VALUE_MEASURED) {
                dangerValue = true;
            }
            return (
                <Marker
                    key={measurement.ID}
                    coordinate={{
                        latitude: measurement.LATITUDE,
                        longitude: measurement.LONGITUDE
                    }}
                    image={
                        dangerValue ?
                            require('../assets/images/danger-placeholder.png')
                            : require('../assets/images/safe-placeholder.png')
                    }
                >
                    <Callout>
                        <Text style={styles.calloutTitle}>
                            {`${measurement.NAME}`}
                        </Text>
                        <Text>
                            {`${measurementTime.getUTCDate()}/${measurementTime.getUTCMonth()}/${measurementTime.getFullYear()} - ${measurementTime.getHours()}:${measurementTime.getMinutes()}`}
                        </Text>
                        <View style={styles.calloutValueContainer}>
                            <Text>
                                Valor:
                            </Text>
                            <Text style={dangerValue ? styles.calloutValueAbnormal : styles.calloutValueNormal}>
                                {`${measurement.VALUE_MEASURED} ${measurement.UNITS}`}
                            </Text>
                        </View>
                        <View style={styles.calloutStateContainer}>
                            <Text>
                                Estado:
                            </Text>
                            <Text style={dangerValue ? styles.calloutStateAbnormal : styles.calloutStateNormal}>
                                {
                                    dangerValue ?
                                        'PELIGROSO'
                                        : 'NORMAL'
                                }
                            </Text>
                        </View>
                    </Callout>
                </Marker>
            )
        })
    };

    render() {
        return (
            <View style={styles.container}>
                <MapView
                    initialRegion={
                        this.state.location ?
                            {
                                latitude: this.state.location.coords.latitude,
                                longitude: this.state.location.coords.longitude,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }
                            : null
                    }
                    onMapReady={this.onMapLayout}
                    style={styles.map}
                >
                    {
                        this.state.isMapReady ?
                            this.renderMarkers()
                            : null
                    }
                </MapView>
                <FloatingAction
                    actions={actions} color='#00B050'
                    onPressItem={(name) => {
                        if (name === 'bt_addmeasurement') {
                            this.props.navigation.navigate('BTManagement', {ID_USER: this.state.user.ID})
                        } else if (name === 'bt_updatemap') {
                            this.getRecentMeasurements();
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
    calloutTitle: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    calloutValueContainer: {
        flexDirection: 'row'
    },
    calloutValueNormal: {
        fontWeight: 'bold',
        color: '#00B050',
        paddingLeft: 5
    },
    calloutValueAbnormal: {
        fontWeight: 'bold',
        color: '#f6511d',
        paddingLeft: 5
    },
    calloutStateContainer: {
        flexDirection: 'row'
    },
    calloutStateNormal: {
        fontWeight: 'bold',
        color: '#00B050',
        paddingLeft: 5
    },
    calloutStateAbnormal: {
        fontWeight: 'bold',
        color: '#f6511d',
        paddingLeft: 5
    }
});
