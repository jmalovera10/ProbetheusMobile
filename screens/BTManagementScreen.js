import React, {useState} from 'react';
import {ActivityIndicator, View, Text, StyleSheet, Image, Platform} from 'react-native';
import {Button} from 'react-native-elements';
import {Ionicons} from "@expo/vector-icons";

// Spinner that show that the application is in the connecting tast
const ConnectingSpinner = () => {

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
const ErrorScreen = ({setBtState, navigation, setBtData}) => {

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
                navigation.navigate('BTDevicesScreen',{setBtData: setBtData})
            }}/>
        </View>
    )
};

// Success icon indicating the connection was done correctly
const SuccessScreen = () => {

    return (
        <View style={styles.connectingContainer}>
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
    const [btState, setBtState] = useState('ERROR');
    const [btData, setBtData] = useState({});

    const connectBTProbe = () => {

    };

    return (
        <View style={styles.mainContainer}>
            {
                btState === 'CONNECTING' ?
                    <ConnectingSpinner/>
                    : null
            }
            {
                btState === 'ERROR' ?
                    <ErrorScreen setBtState={setBtState} navigation={navigation} setBtData={setBtData}/>
                    : null
            }
            {
                btState === 'SUCCESSFUL' ?
                    <View style={styles.successContainer}>
                        <SuccessScreen/>
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
