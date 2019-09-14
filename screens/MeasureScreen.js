import React from 'react';
import {StyleSheet, View, Text, Platform} from 'react-native';
import {Button} from "react-native-elements";
import {Ionicons} from "@expo/vector-icons";
import BluetoothSerial from "react-native-bluetooth-serial";


export default class MeasureScreen extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            mode: this.props.navigation.getParam('mode','TEST'),
            variable: this.props.navigation.getParam('variable','NONE')
        }
    }

    componentWillMount() {
        BluetoothSerial.on('bluetoothDisabled', () => {
            this.props.navigation.goBack();
        });

        BluetoothSerial.on('connectionLost', () => {
            this.props.navigation.goBack();
        });
    }

    render() {
        return(
            <View style={styles.mainContainer}>
                <Text style={styles.titleText}>
                    {this.state.mode === 'TEST'?'PRUEBA':'MEDICIÓN'}
                </Text>
                <Text style={styles.variableText}>
                    {this.state.variable}
                </Text>
                <Ionicons name={Platform.OS === 'ios' ? 'ios-speedometer' : 'md-speedometer'} size={120} color="white"/>
                <Text style={styles.indicationsText}>
                    {
                        this.state.variable === 'PH' || this.state.variable === 'CONDUCTIVIDAD'?
                            `Acerque el sensor de ${this.state.variable} a la fuente de agua`
                            : 'Tome una muestra de la fuente de agua y posiciónela en la ranura de muestras'
                    }
                </Text>
                <Button title='EMPEZAR' color={'#00a6ed'}/>
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
    titleText:{
        color:'#fff',
        fontSize: 30,
        fontWeight: 'bold'
    },
    variableText:{
        color:'#fff',
        fontSize: 20,
        paddingTop: 5,
        paddingBottom: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    indicationsText:{
        color:'#fff',
        fontSize: 20,
        paddingTop: 10,
        paddingLeft:5,
        paddingRight: 5,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});
