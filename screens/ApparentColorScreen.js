import React from "react";
import {View, TouchableHighlight, Text, StyleSheet, Platform} from 'react-native';
import * as Permissions from 'expo-permissions';
import {Camera} from 'expo-camera';
import {Ionicons} from "@expo/vector-icons";

export default class ApparentColorScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hasCameraPermission: null,
            type: Camera.Constants.Type.back,
            flashMode: Camera.Constants.FlashMode.off,
            processing: false
        };
    }

    async componentDidMount() {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({hasCameraPermission: status === 'granted'});
    }

    render() {
        const {hasCameraPermission} = this.state;
        if (hasCameraPermission === null) {
            return <View/>;
        } else if (hasCameraPermission === false) {
            return <Text>No hay acceso a la cámara. Por favor acepte el uso de la cámara.</Text>;
        } else {
            return (
                <View style={{flex: 1}}>
                    <Camera
                        style={{flex: 1}}
                        type={this.state.type}
                        flashMode={this.state.flashMode}
                        ref={ref=>{
                            this.camera = ref;
                        }}
                    >
                        <View
                            style={styles.optionsView}
                        >
                            <TouchableHighlight
                                style={styles.sideActionContainer}
                                onPress={()=>{
                                    this.setState({
                                        flashMode:
                                            this.state.flashMode === Camera.Constants.FlashMode.off
                                                ? Camera.Constants.FlashMode.on
                                                : Camera.Constants.FlashMode.off,
                                    });
                                }}
                            >
                                <Ionicons name={
                                    (this.state.flashMode === Camera.Constants.FlashMode.off?
                                        Platform.OS === 'ios' ? 'ios-flash' : 'md-flash'
                                        :Platform.OS === 'ios' ? 'ios-flash-off' : 'md-flash-off'
                                    )
                                }
                                          size={50}
                                          color={'#FFF'} iconStyle={{marginLeft:20}}/>
                            </TouchableHighlight>
                            <TouchableHighlight
                                style={styles.mainActionContainer}
                                onPress={
                                    async ()=>{
                                        if(this.camera&& ! this.state.processing){
                                            this.setState({processing: true});
                                            let picture = await this.camera.takePictureAsync({
                                                exif: true
                                            });
                                            this.setState({processing: false});
                                            this.props.navigation.navigate('ImagePreviewScreen', {
                                                picture,
                                                ID_USER: this.props.navigation.getParam('ID_USER'),
                                            })
                                        }
                                    }
                                }
                            >
                                <Ionicons name={Platform.OS === 'ios' ? 'ios-camera' : 'md-camera'} size={50}
                                          color={'#FFF'} backgroundColor={'#AAA'} borderRadius={300}/>
                            </TouchableHighlight>
                            <TouchableHighlight
                                style={styles.sideActionContainer}
                                onPress={()=>{
                                    this.setState({
                                        type:
                                            this.state.type === Camera.Constants.Type.back
                                                ? Camera.Constants.Type.front
                                                : Camera.Constants.Type.back,
                                    });
                                }}
                            >
                                <Ionicons name={Platform.OS === 'ios' ? 'ios-reverse-camera' : 'md-reverse-camera'} size={50}
                                          color={'#FFF'} iconStyle={{marginRight:20}}/>
                            </TouchableHighlight>
                        </View>
                    </Camera>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    optionsView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: '15%'
    },
    sideActionContainer: {
        flex: 1,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: 'rgba(170,170,170,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainActionContainer: {
        flex: 1.5,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: 'rgba(170,170,170,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
