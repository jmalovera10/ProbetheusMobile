import React from 'react';
import {Platform, View, StyleSheet} from 'react-native';
import {ListItem} from "react-native-elements";
import {Ionicons} from "@expo/vector-icons";
import {FlatList} from "react-navigation";

export default class MeasurementsScreen extends React.Component{

  static navigationOptions ={
    title: 'Mis mediciones',
  };

  keyExtractor = (item, index) => index.toString();

  renderItem = ({item}) => {
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
        <View style={styles.container}>
          <FlatList/>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});
