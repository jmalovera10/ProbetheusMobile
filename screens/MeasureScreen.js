import React from 'react';
import {StyleSheet, View, Text, Platform} from 'react-native';
import {Button} from "react-native-elements";
import {Ionicons} from "@expo/vector-icons";
import BluetoothSerial from "react-native-bluetooth-serial";


export default class MeasureScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            mode: this.props.navigation.getParam('mode', 'TEST'),
            title: this.props.navigation.getParam('title', 'NONE'),
            identifier: this.props.navigation.getParam('identifier', 'NONE'),
            hasBegun: false,
            periodicMeasurement: null,
            value: null,
            units: null
        };
        this.beginMeasurement = this.beginMeasurement.bind(this);
        this.cancelMeasurements = this.cancelMeasurements.bind(this);
        this.saveMeasurement = this.saveMeasurement.bind(this);
    }

    componentWillMount() {
        BluetoothSerial.on('bluetoothDisabled', () => {
            this.props.navigation.goBack();
        });

        BluetoothSerial.on('connectionLost', () => {
            this.props.navigation.goBack();
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.periodicMeasurement);
        BluetoothSerial.clear();
    }

    /**
     * Method that begins periodic requests to the probe, requesting the current sensor value.
     */
    beginMeasurement() {
        this.setState({
            hasBegun: true,
            periodicMeasurement: setInterval(() => {
                BluetoothSerial.write(this.getCommand(this.state.identifier))
                    .then((written) => {
                        BluetoothSerial.withDelimiter('\n').then(() => {
                            BluetoothSerial.on('read', data => {
                                data = JSON.parse(data.data);
                                if (data.NAME === this.state.identifier) {
                                    this.setState({
                                        value: data.VALUE,
                                        units: data.UNITS
                                    });
                                }
                            });
                        });
                    });
            }, 500)
        })
    }

    /**
     * Method that cancels measurements and returns to previous screen
     */
    cancelMeasurements() {
        clearInterval(this.state.periodicMeasurement);
        this.props.navigation.goBack();
    }

    /**
     * Method that saves the current measurement and sends it to the web server
     */
    saveMeasurement() {
        fetch('TODO: URL', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sensorKey: this.state.identifier,
                valueMeasured: this.state.value,
                units: this.state.units,
                measurementTime: Date.now(),
            }),
        }).then((data) => {
            this.cancelMeasurements();
        }).catch((error) => {
            console.warn(error);
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

    render() {
        return (
            <View style={styles.mainContainer}>
                <Text style={styles.titleText}>
                    {this.state.mode === 'TEST' ? 'PRUEBA' : 'MEDICIÓN'}
                </Text>
                <Text style={styles.variableText}>
                    {this.state.title}
                </Text>
                <Ionicons name={Platform.OS === 'ios' ? 'ios-speedometer' : 'md-speedometer'} size={120} color="white"/>
                {
                    this.state.hasBegun ?
                        <Text style={styles.measurementText}>
                            {this.state.value} {this.state.units}
                        </Text>
                        : <Text style={styles.indicationsText}>
                            {
                                this.state.title === 'PH' || this.state.title === 'CONDUCTIVIDAD' ?
                                    `Acerque el sensor de ${this.state.title} a la fuente de agua`
                                    : 'Tome una muestra de la fuente de agua y posiciónela en la ranura de muestras'
                            }
                        </Text>
                }
                {
                    this.state.hasBegun ?
                        <View>
                            {
                                this.state.mode !== 'TEST' ?
                                    <Button title='GUARDAR' color={'#00a6ed'} onPress={this.saveMeasurement}/>
                                    : null
                            }
                            <Button title='CANCELAR' color={'#ed7d31'} onPress={this.cancelMeasurements}/>
                        </View>
                        : <Button title='EMPEZAR' color={'#00a6ed'} onPress={this.beginMeasurement}/>
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
    variableText: {
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
    }
});
