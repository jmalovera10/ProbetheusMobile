import React from 'react';
import {Image, StyleSheet, Text, View} from "react-native";

export default class HomeHeader extends React.Component {
    render() {
        return (
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>
                        Probetheus
                    </Text>
                </View>
                <View style={styles.headerInformationContainer}>
                    <View style={styles.headerImageContainer}>
                        <Image style={styles.headerImage} source={require('../assets/images/coin.png')}/>
                    </View>
                    <View style={styles.headerScoreContainer}>
                        <Text style={styles.headerTitle}>
                            {this.props.user ? this.props.user.SCORE : 0}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#00B050',
        flex: 1,
        flexDirection: 'row',
    },
    headerTitleContainer: {
        flex: 2
    },
    headerTitle: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
        paddingLeft: '7%',
    },
    headerInformationContainer: {
        flexDirection: 'row',
        flex: 1
    },
    headerScoreContainer: {
        flex: 2
    },
    headerScore: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerImageContainer: {
        flex: 1
    },
    headerImage: {
        width: 30,
        height: 30
    }
});
