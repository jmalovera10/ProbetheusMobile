import React from 'react';
import {StyleSheet, View, Text, Alert} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress'
import {Card, Button} from "react-native-elements";
import {ScrollView} from "react-navigation";
import BluetoothSerial from "react-native-bluetooth-serial";

export default class ProbeScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            batteryPercentage: 0,
            progressPercentage: 0
        };
        this.measurmentVariableModule = this.measurmentVariableModule.bind(this);
        this.goToMeasureScreen = this.goToMeasureScreen.bind(this);
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
                        .then((written) => {
                            if (written) {
                                BluetoothSerial.withDelimiter('\n').then(() => {
                                    BluetoothSerial.on('read', data => {
                                        data = JSON.parse(data.data);
                                        if (data.NAME === 'BATTERY') {
                                            this.setState({batteryPercentage: data.VALUE});
                                        }
                                    });
                                });
                            }
                        })
                        .catch((error) => {
                            //console.warn(error);
                        });
                }
            })
            .catch((error) => {
                //console.warn(error);
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
                            apparentColor?
                                this.goToApparentColorScreen(sensorId)
                                :this.goToMeasureScreen('MEASURE', title, title, sensorId))}
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
            ID_USER: this.props.navigation.getParam('ID_USER'),
            onSuccessfulMeasurement: (name)=>{
                this.onSuccessfulMeasurement(name);
            }
        });
    }

    goToApparentColorScreen(sensorId){
        this.props.navigation.navigate('ApparentColorScreen', {
            sensorId,
            ID_USER: this.props.navigation.getParam('ID_USER'),
            onSuccessfulMeasurement: (name)=>{
                this.onSuccessfulMeasurement(name);
            }
        });
    }

    /**
     * Method that informs the user of a successful measurement
     * @param name
     */
    onSuccessfulMeasurement(name){
        Alert.alert(
            'Felicitaciones!',
            `¡Se ha guardado la medición de ${name} satisfactoriamente! Puede ver esta medición en "Mis Mediciones"`,
            [
                {
                    text: 'OK',
                }
            ]
        )
    }

    componentWillUnmount() {
        BluetoothSerial.disconnect()
            .catch((error) => {
                //console.warn(error);
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
                        this.measurmentVariableModule('PH', 1)
                    }
                    {
                        this.measurmentVariableModule('CONDUCTIVIDAD', 2)
                    }
                </View>
                <View style={styles.measurementContainer}>
                    {
                        this.measurmentVariableModule('TURBIDEZ', 3)
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
