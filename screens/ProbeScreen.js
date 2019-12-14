import React from 'react';
import {StyleSheet, Text, ToastAndroid, View} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress'
import {Button, Card} from "react-native-elements";
import {ScrollView} from "react-navigation";
import BluetoothSerial from "react-native-bluetooth-serial";
import * as ImagePicker from 'expo-image-picker';
import Constants from "expo-constants";
import queueFactory from 'react-native-queue';
import {Notifications} from 'expo';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

export default class ProbeScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            batteryPercentage: 0,
            progressPercentage: 0,
        };
        this.measurmentVariableModule = this.measurmentVariableModule.bind(this);
        this.goToMeasureScreen = this.goToMeasureScreen.bind(this);
        this.goToApparentColorScreen = this.goToApparentColorScreen.bind(this);
        this.uploadImage = this.uploadImage.bind(this);

        queueFactory()
            .then((queue) => {
                // Register the worker function for "example-job" jobs.
                queue.addWorker('upload-image', async (id, payload) => {
                    this.uploadImage(payload);
                });

                this.setState({queue});
            }).catch((err) => {
            console.warn(err);
        });
    }

    static navigationOptions = ({navigation}) => {
        return {
            title: navigation.getParam('probe', {}).name
        }
    };

    componentWillMount() {

        // Request the battery state
        BluetoothSerial.clear()
            .then((isClear) => {
                if (isClear) {
                    BluetoothSerial.write(this.getCommand('BATTERY'))
                        .catch((error) => {
                            console.warn(error);
                        });
                }
            })
            .catch((error) => {
                console.warn(error);
            });


        BluetoothSerial.on('bluetoothDisabled', () => {
            let setBtState = this.props.navigation.getParam('setBtState', null);
            setBtState('ERROR');
            this.props.navigation.goBack();
        });

        BluetoothSerial.on('connectionLost', () => {
            let setBtState = this.props.navigation.getParam('setBtState', null);
            setBtState('ERROR');
            this.props.navigation.goBack();
        });

        BluetoothSerial.withDelimiter('\r\n').then(() => {
            BluetoothSerial.on('read', data => {
                if (!data.data.includes('^J')) {
                    data = JSON.parse(data.data);
                    if (data.NAME === 'BATTERY') {
                        this.setState({batteryPercentage: data.VALUE});
                    }
                }
            });
        });
    }

    /**
     * Method that synthetizes the string command to be sent to the probe
     * @param request the command building request
     * @returns {string}
     */
    getCommand(request) {
        if (request === 'BATTERY') {
            return (JSON.stringify({
                COMMAND: 'BATTERY',
                STATE: 'MEASURE'
            })) + '\n';
        }
    }

    uploadImage(payload) {
        // Upload the image using the fetch and FormData APIs
        let formData = new FormData();

        // Assume "photo" is the name of the form field the server expects
        formData.append('photo', {
            uri: payload.uri,
            name: payload.name,
            type: payload.type
        });
        formData.append('meta_data', JSON.stringify({
            ID_USER: payload.ID_USER,
            ID_SENSOR: payload.ID_SENSOR,
            LATITUDE: payload.LATITUDE,
            LONGITUDE: payload.LONGITUDE,
            TIMESTAMP: Date.now(),
            exif: payload.exif
        }));
        fetch(`${Constants.manifest.extra.production.serverIP}/API/measurement/apparentColor`, {
            method: 'POST',
            body: formData,
            header: {
                Accept: 'application/json',
                'content-type': 'multipart/form-data',
            },
        })
            .then((data) => {
                return data.json();
            })
            .then((data) => {
                Notifications.presentLocalNotificationAsync({
                    title: '¡Foto Subida!',
                    body: 'Hemos subido su foto y pronto le notificaremos el resultado de color aparente.',
                }).catch((err) => {
                    throw err;
                });
            })
            .catch((err) => {
                console.warn(err);
                throw err;
            });
    }

    circularProgressModule(title, indicator) {
        return (
            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                    {title}
                </Text>
                <AnimatedCircularProgress
                    size={120}
                    width={15}
                    tintColor={
                        indicator <= 25 ?
                            '#f6511d' :
                            indicator <= 50 ?
                                '#ffb400' :
                                indicator <= 75 ?
                                    '#00b050' :
                                    '#00a6ed'
                    }
                    rotation={0}
                    backgroundColor={"#999"}
                    fill={indicator}>
                    {
                        (fill) => (
                            <Text style={styles.insideProgressText}>
                                {indicator}%
                            </Text>
                        )
                    }
                </AnimatedCircularProgress>
            </View>
        );
    }

    measurmentVariableModule(title, sensorId, apparentColor) {
        return (
            <Card containerStyle={styles.cardContainer} title={title}>
                <Button title={'MEDIR'} containerStyle={styles.measurementAction} color={'#00a6ed'}
                        onPress={() => (
                            apparentColor ?
                                this.goToApparentColorScreen(sensorId)
                                : this.goToMeasureScreen('MEASURE', title, title, sensorId))}
                />
            </Card>
        );
    }

    /**
     * Method that navigates to the measure screen
     * @param mode of measurement type
     * @param title the title of the measurement
     * @param identifier the measurement identifier
     * @param sensorId the senor ID
     */
    goToMeasureScreen(mode, title, identifier, sensorId) {
        this.props.navigation.navigate('MeasureScreen', {
            mode,
            title,
            identifier,
            sensorId,
            ID_USER: this.props.navigation.getParam('ID_USER')
        });
    }

    goToApparentColorScreen(sensorId) {
        ImagePicker.launchCameraAsync({
            exif: true,
            allowsEditing: true
        }).then((data) => {
            if (!data.cancelled) {
                // ImagePicker saves the taken photo to disk and returns a local URI to it
                let localUri = data.uri;
                let filename = localUri.split('/').pop();

                // Infer the type of the image
                let match = /\.(\w+)$/.exec(filename);
                let type = match ? `image/${match[1]}` : `image`;

                this.getLocationAsync()
                    .then((location) => {
                        if (location) {
                            Notifications.presentLocalNotificationAsync({
                                title: 'Estamos subiendo su foto',
                                body: 'Vamos a subir su foto para extraer el valor de color aparente',
                            }).catch((err) => {
                                throw err;
                            });
                            let payload = {
                                uri: localUri,
                                name: filename,
                                type,
                                ID_USER: this.props.navigation.getParam('ID_USER'),
                                ID_SENSOR: sensorId,
                                LATITUDE: location.coords.latitude,
                                LONGITUDE: location.coords.longitude,
                                exif: data.exif
                            };
                            this.state.queue.createJob('upload-image', payload);
                        }
                    }).catch((err) => {
                    console.warn(err);
                    ToastAndroid.showWithGravity('No fue posible obtener su ubicación. Revise que tiene los permisos activados', ToastAndroid.SHORT, ToastAndroid.CENTER);
                })
            }
        }).catch((err) => {
            console.warn(err);
            ToastAndroid.showWithGravity('No fue posible enviar la medición. Intente nuevamente', ToastAndroid.SHORT, ToastAndroid.CENTER);
        });
    }

    /**
     * Method that requests the current user location
     * @returns {Promise<LocationData>}
     */
    getLocationAsync = async () => {
        let {status} = await Permissions.askAsync(Permissions.LOCATION);
        if (status === 'granted') {
            let location = await Location.getCurrentPositionAsync({});
            return location;
        }
    };

    componentWillUnmount() {
        const command = (JSON.stringify({
            COMMAND: 'NONE',
            STATE: 'IDLE'
        })) + '\n';
        BluetoothSerial.write(command)
            .then((written)=>{
                if(written){
                    BluetoothSerial.disconnect()
                        .catch((error) => {
                            //console.warn(error);
                        });
                }
            })
            .catch((error) => {
                console.warn(error);
            });
    }

    render() {
        return (
            <ScrollView style={styles.mainContainer}>
                <View style={styles.statusContainer}>
                    {
                        this.circularProgressModule('Batería', this.state.batteryPercentage)
                    }
                    {
                        //this.circularProgressModule('Progreso diario', this.state.progressPercentage)
                    }
                </View>
                <View style={styles.measurementContainer}>
                    {
                        this.measurmentVariableModule('pH', 1)
                    }
                    {
                        this.measurmentVariableModule('CONDUCTIVIDAD', 2)
                    }
                </View>
                <View style={styles.measurementContainer}>
                    {
                        this.measurmentVariableModule('TURBIEDAD', 3)
                    }
                    {
                        this.measurmentVariableModule('COLOR APARENTE', 4, true)
                    }
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    statusContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    progressContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    progressText: {
        paddingBottom: 10,
        fontSize: 15,
    },
    insideProgressText: {
        fontSize: 30,
    },
    measurementContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    cardContainer: {
        flex: 1,
    },
    measurementAction: {
        paddingBottom: 10
    }
});
