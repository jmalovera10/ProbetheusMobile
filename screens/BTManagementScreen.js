import React, {useState} from 'react';
import {ActivityIndicator, View, Text, StyleSheet, Platform, AsyncStorage} from 'react-native';
// import {BleManager} from 'react-native-ble-plx';
import BluetoothSerial from 'react-native-bluetooth-serial';
import {Button} from 'react-native-elements';
import {Ionicons} from "@expo/vector-icons";
// import * as IntentLauncher from 'expo-intent-launcher';

/**
 * Method that stores the probe information to the local storage
 * @param btDevice the BT device to be stored
 * @returns {Promise<void>}
 */
const storeProbe = async (btDevice) => {
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
const retrieveProbe = async () => {
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
 * Spinner that show that the application is in the connecting tast
 * @param btDevice the device to be connected to
 * @param setBtDevice method to update the BT device in case it is not found
 * @param setBtState method that changes the current BT management state
 * @returns {*}
 * @constructor
 */
const ConnectingSpinner = ({btDevice, setBtDevice, setBtState}) => {

    if (btDevice) {
        BluetoothSerial.isConnected()
            .then((connected) => {
                if (connected) {
                    setBtState('SUCCESSFUL');
                } else {
                    BluetoothSerial.connect(btDevice.id)
                        .then((res) => {
                            setBtState('SUCCESSFUL');
                        })
                        .catch((error) => {
                            console.warn(error);
                            setBtState('ERROR');
                        })
                }
            });
        /*
        btDevice.connect({})
            .then((device) => {
                console.warn({
                    id: device.id,
                    name: device.name,
                    rssi: device.rssi,
                    isConnected: device.isConnected(),
                    connectable: device.isConnectable
                });
                return device.discoverAllServicesAndCharacteristics();
            })
            .then((device) => {
                console.warn({
                    id: device.id,
                    name: device.name,
                    rssi: device.rssi,
                    isConnected: device.isConnected,
                    connectable: device.isConnectable
                });
                setBtState('SUCCESSFUL');
            })
            .catch((error) => {
                console.warn(error);
                setBtState('ERROR');
            })*/
    } else {
        retrieveProbe()
            .then((probe) => {
                if (probe) {
                    BluetoothSerial.isConnected()
                        .then((connected) => {
                            if (connected) {
                                setBtState('SUCCESSFUL');
                            } else {
                                BluetoothSerial.connect(probe.id)
                                    .then((res) => {
                                        setBtDevice(probe);
                                        setBtState('SUCCESSFUL');
                                    })
                                    .catch((error) => {
                                        console.warn(error);
                                        setBtState('ERROR');
                                    })
                            }
                        });
                } else {
                    setBtState('ERROR');
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

// Appears if something went wrong during the probe BT connection
const ErrorScreen = ({setBtState, navigation, connectBTProbe}) => {

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
                setBtState('CONNECTING');

            }}/>
            <Button title='AGREGAR NUEVA' type='solid' containerStyle={styles.optionButtonContainer}
                    buttonStyle={styles.optionButton} onPress={() => {
                navigation.navigate('BTDevicesScreen', {connectBTProbe: connectBTProbe});
                // IntentLauncher.startActivityAsync(IntentLauncher.ACTION_BLUETOOTH_SETTINGS);
            }}/>
        </View>
    )
};

// Success icon indicating the connection was done correctly
const SuccessScreen = ({navigation, btDevice}) => {
    setTimeout(() => {
        storeProbe(btDevice);
        navigation.navigate('ProbeScreen', {probe: btDevice});
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

export default function BTManagementScreen({navigation}) {

    // BT states could be CONNECTING, ERROR, SUCCESSFUL
    const [btState, setBtState] = useState('CONNECTING');
    const [btDevice, setBtDevice] = useState(null);
    // const [btManager, setBtManager] = useState(new BleManager());

    const connectBTProbe = (device) => {
        setBtDevice(device);
        setBtState('CONNECTING');
    };

    return (
        <View style={styles.mainContainer}>
            {
                btState === 'CONNECTING' ?
                    <ConnectingSpinner btDevice={btDevice} setBtState={setBtState} setBtDevice={setBtDevice}/>
                    : null
            }
            {
                btState === 'ERROR' ?
                    <ErrorScreen setBtState={setBtState} navigation={navigation} connectBTProbe={connectBTProbe}/>
                    : null
            }
            {
                btState === 'SUCCESSFUL' ?
                    <View style={styles.successContainer}>
                        <SuccessScreen navigation={navigation} btDevice={btDevice}/>
                    </View>
                    : null
            }
        </View>
    );
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
