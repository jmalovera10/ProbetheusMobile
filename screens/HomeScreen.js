import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Image
} from 'react-native';
import {FloatingAction} from "react-native-floating-action";

const actions = [
    {
        text: 'Nueva Medición',
        icon: require('../assets/images/add-square-button.png'),
        name: 'bt_addmeasurement',
        position: 1,
        color: '#00B050'
    }
];

export default function HomeScreen({navigation}) {
    return (
        <View style={styles.container}>
            <FloatingAction
                actions={actions} color='#00B050'
                onPressItem={(name)=>{
                    if(name === 'bt_addmeasurement'){
                        navigation.navigate('BTManagement')
                    }
                }}
            />
        </View>
    );
}

const ProbetheusHeader = () => (
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
                    1000
                </Text>
            </View>
        </View>
    </View>
);
//<Image source={require('')}/>
HomeScreen.navigationOptions = {
    headerTitle: <ProbetheusHeader/>,
    headerStyle: {
        backgroundColor: '#00B050',
    },
    headerTitleStyle: {
        color: '#FFFFFF',
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
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
