import React from 'react';
import {StyleSheet, View, Text, Platform, ToastAndroid} from 'react-native';
import {Button} from "react-native-elements";
import {Ionicons} from "@expo/vector-icons";
import Constants from 'expo-constants';
import BluetoothSerial from "react-native-bluetooth-serial";
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import queueFactory from "react-native-queue";
import {Notifications} from "expo";


export default class MeasureScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            title: this.props.navigation.getParam('title', 'NONE'),
            identifier: this.props.navigation.getParam('identifier', 'NONE'),
            sensorId: this.props.navigation.getParam('sensorId', 'NONE'),
            hasBegun: false,
            value: null,
            units: null
        };
        this.getLocationAsync = this.getLocationAsync.bind(this);
        this.beginMeasurement = this.beginMeasurement.bind(this);
        this.cancelMeasurements = this.cancelMeasurements.bind(this);
        this.saveMeasurement = this.saveMeasurement.bind(this);
    }

    componentWillMount() {

        BluetoothSerial.on('bluetoothDisabled', () => {
            this.props.navigation.goBack();
        });

        BluetoothSerial.on('connectionLost', () => {
            if (Platform.OS === 'android') {
                ToastAndroid.showWithGravity('Se ha perdido la conexión con la sonda', ToastAndroid.LONG, ToastAndroid.CENTER);
            }
            this.props.navigation.goBack();
        });

        BluetoothSerial.withDelimiter('\r\n').then(() => {
            BluetoothSerial.on('read', data => {
                if (!data.data.includes('^J')) {
                    data = JSON.parse(data.data);
                    if (data.NAME === this.state.identifier) {
                        this.setState({
                            value: data.VALUE,
                            units: data.UNITS
                        });
                    }
                }
            });
        });
    }

    componentWillUnmount() {
        const command = (JSON.stringify({
            COMMAND: 'NONE',
            STATE: 'IDLE'
        })) + '\n';
        BluetoothSerial.write(command)
            .then((written) => {
                if (written) {
                    BluetoothSerial.clear();
                }
            })
            .catch((err) => {
                console.warn(err);
            });
    }

    /**
     * Method that begins measuring state, requesting the current sensor value.
     */
    beginMeasurement() {
        BluetoothSerial.write(this.getCommand(this.state.identifier))
            .then((written) => {
                if (written) {
                    this.setState({
                        hasBegun: true
                    })
                }
            })
            .catch((err) => {
                console.warn(err);
            })
        ;
    }

    /**
     * Method that cancels measurements and returns to previous screen
     */
    cancelMeasurements() {
        const command = (JSON.stringify({
            COMMAND: 'NONE',
            STATE: 'IDLE'
        })) + '\n';
        BluetoothSerial.write(command)
            .then((written) => {
                if (written) {
                    this.props.navigation.goBack();
                }
            })
            .catch((err) => {
                console.warn(err);
            })
        ;
    }

    /**
     * Method that saves the current measurement and sends it to the web server
     */
    saveMeasurement() {
        Notifications.presentLocalNotificationAsync({
            title: 'Estamos subiendo su medición',
            body: '¡Vamos a subir su aporte para monitorear el agua de su comunidad!',
        }).catch((err) => {
            throw err;
        });
        this.getLocationAsync()
            .then((location) => {
                if (location) {
                    fetch(`${Constants.manifest.extra.production.serverIP}/API/measurement`, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            ID_USER: this.props.navigation.getParam('ID_USER'),
                            ID_SENSOR: this.state.sensorId,
                            VALUE_MEASURED: this.state.value,
                            UNITS: this.state.units,
                            MEASUREMENT_TIME: Date.now(),
                            LATITUDE: location.coords.latitude,
                            LONGITUDE: location.coords.longitude
                        }),
                    }).then((data) => {
                        return data.json();
                    }).then((data) => {
                        Notifications.presentLocalNotificationAsync({
                            title: '¡Medición enviada!',
                            body: 'La medición se ha subido satisfactoriamente. Puede verla en el mapa y en sus mediciones ¡Sigue con el buen trabajo!',
                        }).catch((err) => {
                            throw err;
                        });
                        this.cancelMeasurements();
                    }).catch((error) => {
                        if (Platform.OS === 'android') {
                            ToastAndroid.showWithGravity('Hay problemas de conexión a internet', ToastAndroid.LONG, ToastAndroid.CENTER);
                        }
                    });
                }
            })
            .catch((error) => {
                if (Platform.OS === 'android') {
                    ToastAndroid.showWithGravity('Hay problemas de conexión a internet', ToastAndroid.LONG, ToastAndroid.CENTER);
                }
            });
    }

    /**
     * Method that synthetizes the string command to be sent to the probe
     * @param request the command building request
     * @returns {string}
     */
    getCommand(request) {
        return (JSON.stringify({
            COMMAND: this.state.identifier,
            STATE: 'MEASURE'
        })) + '\n';
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

    render() {
        return (
            <View style={styles.mainContainer}>
                <Text style={styles.titleText}>
                    MEDICIÓN
                </Text>
                <Text style={styles.variableText}>
                    {this.state.title}
                </Text>
                <Ionicons name={Platform.OS === 'ios' ? 'ios-speedometer' : 'md-speedometer'} size={120} color="white"/>
                {
                    this.state.hasBegun ?
                        <View style={styles.measurementContainer}>
                            <Text style={styles.measurementText}>
                                {this.state.value}
                            </Text>
                            <Text style={styles.unitsText}>
                                {this.state.units}
                            </Text>
                        </View>
                        : <Text style={styles.indicationsText}>
                            {
                                this.state.title === 'pH' || this.state.title === 'CONDUCTIVIDAD' ?
                                    `Asegúrese de que el sensor de ${this.state.title} se encuentra conectado a la parte frontal de la sonda y acerque el sensor de ${this.state.title} a la fuente de agua`
                                    : 'Tome una muestra de la fuente de agua y posiciónela en la ranura de muestras'
                            }
                        </Text>
                }
                {
                    this.state.hasBegun ?
                        <View style={styles.buttonContainer}>
                            <Button title='CANCELAR' containerStyle={styles.optionButton}
                                    buttonStyle={styles.cancelButton}
                                    onPress={this.cancelMeasurements}/>
                            <Button title='GUARDAR' containerStyle={styles.optionButton}
                                    buttonStyle={styles.positiveButton}
                                    onPress={this.saveMeasurement}/>
                        </View>
                        : <View style={styles.buttonContainer}>
                            <Button title='EMPEZAR' containerStyle={styles.optionButton} buttonStyle={styles.positiveButton}
                                    onPress={this.beginMeasurement}/>
                        </View>
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#00B050',
        justifyContent: 'center',
        alignItems: 'center'
    },
    titleText: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold'
    },
    measurementContainer: {
        justifyContent: 'center',
        padding: 5
    },
    variableText: {
        color: '#fff',
        fontSize: 25,
        paddingTop: 5,
        paddingBottom: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    unitsText: {
        color: '#fff',
        fontSize: 25,
        paddingTop: 5,
        paddingBottom: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    indicationsText: {
        color: '#fff',
        fontSize: 20,
        paddingTop: 10,
        paddingLeft: 5,
        paddingRight: 5,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    measurementText: {
        color: '#fff',
        fontSize: 70,
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 5,
        paddingRight: 5,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonContainer: {
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    optionButton: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 10,
        paddingRight: 10
    },
    cancelButton: {
        backgroundColor: '#ed7d31'
    },
    positiveButton: {
        backgroundColor: '#00a6ed'
    }

});
