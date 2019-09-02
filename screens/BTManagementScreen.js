import React, {useState} from 'react';
import {ActivityIndicator, View, Text, StyleSheet, Image, Button} from 'react-native';

export default function BTManagementScreen({navigate}) {

    // BT states could be CONNECTING, ERROR, UNABLE_TO_CONNECT, SELECT_BT
    const [btState, setBtState] = useState('ERROR');

    return (
        <View style={styles.mainContainer}>
            {
                btState === 'CONNECTING' ?
                    <View style={styles.connectingContainer}>
                        <ActivityIndicator style={styles.spinner} size={120} color='#FFF'/>
                        <Text style={styles.informationText}>
                            Conectando con la sonda...
                        </Text>
                    </View>
                    : null
            }
            {
                btState === 'ERROR' ?
                    <View style={styles.errorContainer}>
                        <Image source={require('../assets/images/sad.png')} style={styles.errorImage}/>
                        <Text style={styles.informationText}>
                            Oops! No se pudo conectar con la sonda.
                        </Text>
                        <Text style={styles.indicationsText}>
                            Asegúrate que esté prendida o si es una sonda nueva selecciona "Agregar Nueva".
                        </Text>
                        <Button title='REINTENTAR' color='#FFF' style={styles.optionButton}/>
                        <Button title='AGREGAR NUEVA' color='#FFF'/>
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
    optionButton: {
        flex: 1
    }
});
