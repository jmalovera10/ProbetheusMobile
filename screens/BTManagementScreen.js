import React from 'react';
import {ActivityIndicator, View, Text, StyleSheet, Platform, AsyncStorage} from 'react-native';
import BluetoothSerial from 'react-native-bluetooth-serial';
import {Button} from 'react-native-elements';
import {Ionicons} from "@expo/vector-icons";

export default class BTManagementScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            btState: 'CONNECTING',
            btDevice: null
        };
        this.ErrorScreen = this.ErrorScreen.bind(this);
        this.SuccessScreen = this.SuccessScreen.bind(this);
    }

    /**
     * Method that retrieves a probe's information from local storage
     * @returns {Promise<void>}
     */
    storeProbe = async (btDevice) => {
        try {
            await AsyncStorage.setItem('BT_PROBE', JSON.stringify(btDevice));
        } catch (error) {
            console.warn(error);
        }
    };

    /**
     * Method that retrieves a probe's information from local storage
     * @returns {Promise<void>}
     */
    retrieveProbe = async () => {
        try {
            let probe = await AsyncStorage.getItem('BT_PROBE');
            if (probe) {
                probe = JSON.parse(probe);
            }
            return probe

        } catch (error) {
            console.warn(error);
        }
    };

    /**
     * Spinner that show that the application is in the connecting task
     * @returns {*}
     * @constructor
     */
    ConnectingSpinner = () => {
        if (this.state.btDevice) {
            BluetoothSerial.isConnected()
                .then((connected) => {
                    if (connected) {
                        this.setState({btState: 'SUCCESSFUL'});
                    } else {
                        BluetoothSerial.connect(this.state.btDevice.id)
                            .then((res) => {
                                this.setState({btState: 'SUCCESSFUL'});
                            })
                            .catch((error) => {
                                console.warn(error);
                                this.setState({btState: 'ERROR'});
                            })
                    }
                });
        } else {
            this.retrieveProbe()
                .then((probe) => {
                    if (probe) {
                        BluetoothSerial.isConnected()
                            .then((connected) => {
                                if (connected) {
                                    this.setState({btState: 'SUCCESSFUL'});
                                } else {
                                    BluetoothSerial.connect(probe.id)
                                        .then((res) => {
                                            this.setState({
                                                btState: 'SUCCESSFUL',
                                                btDevice: probe
                                            });
                                        })
                                        .catch((error) => {
                                            console.warn(error);
                                            this.setState({btState: 'ERROR'});
                                        })
                                }
                            });
                    } else {
                        this.setState({btState: 'ERROR'});
                    }
                });
        }
        return (
            <View style={styles.connectingContainer}>
                <ActivityIndicator style={styles.spinner} size={120} color='#FFF'/>
                <Text style={styles.informationText}>
                    Conectando con la sonda...
                </Text>
            </View>
        )
    };

    ErrorScreen = () => {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name={Platform.OS === 'ios' ? 'ios-sad' : 'md-sad'} size={120} color="white"/>
                <Text style={styles.informationText}>
                    Oops! No se pudo conectar con la sonda.
                </Text>
                <Text style={styles.indicationsText}>
                    Asegúrate que esté prendida o si es una sonda nueva selecciona "Agregar Nueva".
                </Text>
                <Button title='REINTENTAR' type='solid' containerStyle={styles.optionButtonContainer}
                        buttonStyle={styles.optionButton} onPress={() => {
                    this.setState({btState: 'CONNECTING'});

                }}/>
                <Button title='AGREGAR NUEVA' type='solid' containerStyle={styles.optionButtonContainer}
                        buttonStyle={styles.optionButton} onPress={() => {
                    this.props.navigation.navigate('BTDevicesScreen', {
                        connectBTProbe: (device, callback) => {
                            this.setState({
                                btDevice: device,
                                btState: 'CONNECTING'
                            }, callback)
                        }
                    });
                }}/>
            </View>
        )
    };

    SuccessScreen = () => {
        setTimeout(() => {
            this.storeProbe(this.state.btDevice);
            this.props.navigation.navigate('ProbeScreen', {
                probe: this.state.btDevice, setBtState: (state) => {
                    this.setState({btState: state});
                }
            });
        }, 2000);
        return (
            <View style={styles.successContainer}>
                <Ionicons name={Platform.OS === 'ios' ? 'ios-checkmark-circle' : 'md-checkmark-circle'} size={120}
                          color="white"/>
                <Text style={styles.informationText}>
                    Sonda conectada!
                </Text>
            </View>
        )
    };

    componentWillUnmount() {
        BluetoothSerial.disconnect()
            .catch((error)=>{
                console.warn(error);
            });
    }

    render() {

        return (
            <View style={styles.mainContainer}>
                {
                    this.state.btState === 'CONNECTING' ?
                        this.ConnectingSpinner()
                        : null
                }
                {
                    this.state.btState === 'ERROR' ?
                        this.ErrorScreen()
                        : null
                }
                {
                    this.state.btState === 'SUCCESSFUL' ?
                        <View style={styles.successContainer}>
                            {
                                this.SuccessScreen()
                            }
                        </View>
                        : null
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    connectingContainer: {
        flex: 1,
        backgroundColor: '#00B050',
        justifyContent: 'center',
    },
    spinner: {
        marginTop: '5%',
        marginBottom: '5%'
    },
    informationText: {
        color: '#FFF',
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        backgroundColor: '#ed7d31',
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorImage: {
        width: 100,
        height: 100,
        marginTop: '5%',
        marginBottom: '5%'
    },
    indicationsText: {
        color: '#FFF',
        fontSize: 20,
        textAlign: 'center',
    },
    optionButtonContainer: {
        width: '90%',
        marginTop: 20,
        marginBottom: 10,
    },
    optionButton: {
        backgroundColor: '#00A6ED'
    },
    successContainer: {
        flex: 1,
        backgroundColor: '#00B050',
        justifyContent: 'center',
        alignItems: 'center'
    },
});
