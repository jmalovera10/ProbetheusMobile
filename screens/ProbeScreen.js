import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress'
import {Card, Button} from "react-native-elements";
import {ScrollView} from "react-navigation";

export default class ProbeScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            batteryPercentage: 100,
            progressPercentage: 50
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

    measurmentVariableModule(title) {
        return (
            <Card containerStyle={styles.cardContainer} title={title}>
                <Button title={'PROBAR'} containerStyle={styles.measurementAction}/>
                <Button title={'MEDIR'} containerStyle={styles.measurementAction}/>
            </Card>
        );
    }

    render() {
        return (
            <ScrollView style={styles.mainContainer}>
                <View style={styles.statusContainer}>
                    {
                        this.circularProgressModule('Batería', this.state.batteryPercentage)
                    }
                    {
                        this.circularProgressModule('Progreso diario', this.state.progressPercentage)
                    }
                </View>
                <View style={styles.measurementContainer}>
                    {
                        this.measurmentVariableModule('PH')
                    }
                    {
                        this.measurmentVariableModule('CONDUCTIVIDAD')
                    }
                </View>
                <View style={styles.measurementContainer}>
                    {
                        this.measurmentVariableModule('TURBIDEZ')
                    }
                    {
                        this.measurmentVariableModule('COLOR APARENTE')
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
    measurementAction:{
        paddingBottom: 10
    }
});
