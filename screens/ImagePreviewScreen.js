import React from "react";
import {View, ImageBackground, StyleSheet, Platform, ToastAndroid} from 'react-native';
import {Button} from "react-native-elements";
import Constants from "expo-constants";

export default class ImagePreviewScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            picture: this.props.navigation.getParam('picture'),
        };
        this.cancelMeasurements = this.cancelMeasurements.bind(this);
        this.saveMeasurement = this.saveMeasurement.bind(this);
    }

    /**
     * Method that cancels measurements and returns to previous screen
     */
    cancelMeasurements() {
        this.props.navigation.goBack();
    }

    /**
     * Method that saves the current measurement and sends it to the web server
     */
    saveMeasurement() {
        console.warn(this.state.picture);
        this.cancelMeasurements();
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <ImageBackground source={{
                    uri: this.state.picture.uri
                }}
                       style={styles.imageStyle}
                >
                    <View style={styles.optionsContainer}>
                        <View style={styles.buttonContainer}>
                            <Button title='CANCELAR' containerStyle={styles.optionButton}
                                    buttonStyle={styles.cancelButton}
                                    onPress={this.cancelMeasurements}/>
                            <Button title='GUARDAR' containerStyle={styles.optionButton}
                                    buttonStyle={styles.positiveButton}
                                    onPress={this.saveMeasurement}/>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    imageStyle: {
        width: '100%',
        height: '100%'
    },
    optionsContainer:{
        flex:1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: '5%'
    },
    buttonContainer: {
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    optionButton: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 10,
        paddingRight: 10
    },
    cancelButton: {
        backgroundColor: '#ed7d31'
    },
    positiveButton: {
        backgroundColor: '#00a6ed'
    }
});
