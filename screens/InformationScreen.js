import React from "react";
import {Image, StyleSheet, View, Text} from 'react-native';

export default class InformationScreen extends React.Component {

    static navigationOptions = {
        title: 'Información',
        headerStyle: {
            backgroundColor: '#00B050',
        },
        headerTitleStyle: {
            color: '#FFFFFF',
        }
    };

    render() {
        return (
            <View style={styles.container}>
                <Image style={styles.headerImage} source={require('../assets/images/facultad-ingenieria.png')}/>
                <Text style={styles.vigiladaText}>
                    Universidad de los Andes | Vigilada Mineducación. Reconocimiento como Universidad: Decreto 1297 del
                    30 de mayo de 1964. Reconocimiento Personería Jurídica: Resolución 28 del 23 de febrero de 1949 Minjusticia
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerImage: {
        maxWidth: '80%',
        maxHeight: '20%',
    },
    vigiladaText:{
        textAlign: 'center',
        paddingTop: 10
    }
});
