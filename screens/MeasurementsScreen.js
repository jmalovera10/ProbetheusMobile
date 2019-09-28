import React from 'react';
import {Platform, View, StyleSheet, AsyncStorage} from 'react-native';
import {Constants} from 'expo-constants';
import {ListItem} from "react-native-elements";
import {Ionicons} from "@expo/vector-icons";
import {FlatList} from "react-navigation";

export default class MeasurementsScreen extends React.Component {

    static navigationOptions = {
        title: 'Mis mediciones',
    };

    constructor(props) {
        super(props);
        this.state = {
            measurements: []
        };
        this.retrieveMyMeasurements = this.retrieveMyMeasurements.bind(this);
    }

    componentWillMount() {
        if (this.state.measurements.length === 0) {
            this.retrieveMyMeasurements()
                .catch((error)=>{
                    console.warn(error);
                });
        }
    }

    retrieveMyMeasurements = async ()=>{
        let user = await AsyncStorage.getItem('USER');
        if (user) {
            user = JSON.parse(user);
            this.setState({user});
            this.props.navigation.setParams({user});
            fetch(`${Constants.manifest.constants.production.serverIP}/API/measurements/user/${user.ID}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                }
            }).then((data) => {
                return data.json();
            }).then((data) => {
                this.setState({measurements: data});
            })
        }
    };

    keyExtractor = (item, index) => index.toString();

    renderItem = ({item}) => {
        return (
            <ListItem
                title={item.name}
                subtitle={item.id}
                leftAvatar={<Ionicons name={Platform.OS === 'ios' ? 'ios-water' : 'md-water'} size={50}
                                      color="#00A6ED"/>}
                bottomDivider
                chevron
            />
        );
    };

    render() {
        return (
            <View style={styles.container}>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
});
