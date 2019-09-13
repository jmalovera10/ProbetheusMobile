import React, {useState} from 'react';
import {ActivityIndicator, Platform, StyleSheet, Text, View} from 'react-native';
import {BleManager} from 'react-native-ble-plx';
import {ListItem} from "react-native-elements";
import {Ionicons} from "@expo/vector-icons";
import {FlatList} from "react-navigation";

export default class BTDevicesScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            btDevices: []
        };
        this.btManager = new BleManager();
        this.scanDevices = this.scanDevices.bind(this);
    }

    componentWillMount() {
        this.btManager.state()
            .then((current) => {
                if (current === 'PoweredOn') {
                    this.scanDevices();
                } else {
                    this.btManager.enable()
                        .then(() => {
                            this.scanDevices();
                        }).catch((err) => {
                        console.warn(err);
                    });
                }
            });

    }

    scanDevices() {
        this.btManager.startDeviceScan(null, {allowDuplicates: false}, (error, device) => {
            if (error) {
                // Handle error (scanning will be stopped automatically)
                console.warn(error);
                return
            }
            // this.manager.stopDeviceScan();
            this.setState((prevState) => {
                let devices = prevState.btDevices;
                let updateIndex = false;
                let check = devices.map((item) => {
                    updateIndex = (item.id === device.id) || updateIndex;
                    return item.id === device.id ? device : item;
                });
                if (!updateIndex) {
                    check.push(device);
                }
                return {btDevices: check};
            })
        });
        /*
        this.btManager.connectToDevice('B8:27:EB:BD:1E:66')
            .then((device)=>{
                console.warn(device);
            })
            .catch((err)=>{
                console.warn(err);
            })
            */
    }

    keyExtractor = (item, index) => index.toString();

    renderItem = ({item}) => {
        let connectionManage = () => {
            this.btManager.stopDeviceScan();
            this.btManager.destroy();
            let connectBT = this.props.navigation.getParam('connectBTProbe', null);
            connectBT(item);
            this.props.navigation.goBack();
            /*
            item.connect({})
                .then((device) => {
                    console.warn({
                        id: device.id,
                        name: device.name,
                        rssi: device.rssi,
                        isConnected: device.isConnected,
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
                })
                .catch((error) => {
                    console.warn(error);
                })*/
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
