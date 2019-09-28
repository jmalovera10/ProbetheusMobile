import React, {useState} from 'react';
import {ActivityIndicator, Platform, StyleSheet, Text, View, ToastAndroid} from 'react-native';
import BluetoothSerial from 'react-native-bluetooth-serial';
import {ListItem} from "react-native-elements";
import {Ionicons} from "@expo/vector-icons";
import {FlatList} from "react-navigation";

export default class BTDevicesScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            btDevices: []
        };
        // this.btManager = new BleManager();
        //this.scanDevices = this.scanDevices.bind(this);
        this.discoverBTDevices = this.discoverBTDevices.bind(this);
        this.listBTDevices = this.listBTDevices.bind(this);
    }


    discoverBTDevices(){
        BluetoothSerial.discoverUnpairedDevices()
            .then((unpairedDevices) => {
                this.setState((lastState)=>{
                    let allDevices = lastState.btDevices;
                    allDevices = allDevices.concat(unpairedDevices);
                    BluetoothSerial.cancelDiscovery()
                        .catch((err) => console.log(err.message));
                    return {btDevices: allDevices}
                })
            })
            .catch((err) => console.log(err.message))
    }

    listBTDevices() {
        BluetoothSerial.list()
            .then((btDevices) => {
                this.setState((lastState)=>{
                    let allDevices = lastState.btDevices;
                    allDevices = allDevices.concat(btDevices);
                    // console.warn(allDevices);
                    return {btDevices: allDevices};
                })
            })
            .catch((error) => {
                console.warn(error);
            });
    }

    componentWillMount() {
        BluetoothSerial.isEnabled()
            .then((enabled)=>{
                if(!enabled){
                    BluetoothSerial.enable()
                        .then(() => {
                            setTimeout(this.discoverBTDevices,5000);
                            setTimeout(this.listBTDevices,5000);
                        })
                        .catch((error) => {
                            console.warn(error);
                        });
                }else {
                    this.discoverBTDevices();
                    this.listBTDevices();
                }
            })
            .catch((error)=>{
                console.warn(error);
            });


        BluetoothSerial.on('bluetoothDisabled', () => {
            if(Platform.OS === 'android'){
                ToastAndroid.showWithGravity('No hay conexión Bluetooth',ToastAndroid.SHORT, ToastAndroid.CENTER);
            }
            this.props.navigation.goBack();
        });
        BluetoothSerial.on('error', (err) => console.warn(`Error: ${err.message}`))
    }

    keyExtractor = (item, index) => index.toString();

    renderItem = ({item}) => {
        let connectionManage = () => {
            /*
            this.btManager.stopDeviceScan();
            this.btManager.destroy();*/
            let connectBT = this.props.navigation.getParam('connectBTProbe', null);
            connectBT(item, ()=>{
                this.props.navigation.goBack();
            });
        };
        return (
            <ListItem
                title={item.name}
                subtitle={item.id}
                leftAvatar={<Ionicons name={Platform.OS === 'ios' ? 'ios-bluetooth' : 'md-bluetooth'} size={50}
                                      color="#00A6ED"/>}
                bottomDivider
                chevron
                onPress={connectionManage}
            />
        );
    };

    render() {
        return (
            <View style={styles.mainContainer}>
                {
                    this.state.btDevices && this.state.btDevices.length > 0 ?
                        <FlatList
                            keyExtractor={this.keyExtractor}
                            data={this.state.btDevices}
                            renderItem={this.renderItem}
                        />
                        : <View style={styles.connectingContainer}>
                            <ActivityIndicator style={styles.spinner} size={120} color='#00B050'/>
                            <Text style={styles.informationText}>
                                Buscando dispositivos...
                            </Text>
                        </View>
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
        justifyContent: 'center',
    },
    spinner: {
        marginTop: '5%',
        marginBottom: '5%'
    },
    informationText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
