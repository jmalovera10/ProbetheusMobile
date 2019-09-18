import React, {useEffect, useState} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Image, AsyncStorage
} from 'react-native';
import {FloatingAction} from "react-native-floating-action";
import {sha256} from 'react-native-sha256';
import {Ionicons} from "@expo/vector-icons";

const actions = [
    {
        text: 'Nueva Medición',
        icon: require('../assets/images/add-square-button.png'),
        name: 'bt_addmeasurement',
        position: 1,
        color: '#00B050'
    }
];

/**
 * Method that retrieves the user information from local storage
 * @returns {Promise<void>}
 */
const retrieveUser = async (setUser) => {
    try {
        let user = await AsyncStorage.getItem('USER');
        if (user) {
            user = JSON.parse(user);
            setUser(user);
        } else {
            /*
            sha256(`${Date.now()}` )
                .then((hash) => {
                    storeUser(hash);
                    setUser(hash);
                })
                .catch((error)=>{
                    console.warn(error);
                });*/
        }

    } catch (error) {
        console.warn(error);
    }
};

/**
 * Method that stores a user information from local storage
 * @returns {Promise<void>}
 */
const storeUser = async (userID) => {
    try {
        await AsyncStorage.setItem('USER', JSON.stringify({userID}));
    } catch (error) {
        console.warn(error);
    }
};

const ProbetheusHeader = (userScore) => (
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

const NoInfoModule = ()=>(
    <View style={styles.noInfoContainer}>
        <Ionicons name={Platform.OS === 'ios' ? 'ios-information-circle' : 'md-information-circle'} size={120}
                  color={'#888'}/>
        <Text style={styles.informationText}>
            No hay información disponible
        </Text>
    </View>
);

export default function HomeScreen({navigation}) {

    let [user, setUser] = useState(null);
    useEffect(() => {
        retrieveUser(setUser);
    });
    return (
        <View style={styles.container}>
            <NoInfoModule/>
            <FloatingAction
                actions={actions} color='#00B050'
                onPressItem={(name) => {
                    if (name === 'bt_addmeasurement') {
                        navigation.navigate('BTManagement',{user})
                    }
                }}
            />
        </View>
    );
}

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
    },
    noInfoContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    informationText: {
        fontSize: 20,
        color: '#888',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
