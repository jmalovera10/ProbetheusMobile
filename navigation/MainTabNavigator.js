import React from 'react';
import {Platform} from 'react-native';
import {createStackNavigator, createBottomTabNavigator} from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import MeasurementsScreen from '../screens/MeasurementsScreen';

const config = Platform.select({
    web: {headerMode: 'screen'},
    default: {},
});

const HomeStack = createStackNavigator(
    {
        Home: HomeScreen,
    },
    config
);

HomeStack.navigationOptions = {
    tabBarLabel: 'Inicio',
    tabBarIcon: ({focused}) => (
        <TabBarIcon
            focused={focused}
            name={
                Platform.OS === 'ios'
                    ? `ios-home`
                    : 'md-home'
            }
        />
    ),
};

HomeStack.path = '';

const LinksStack = createStackNavigator(
    {
        Links: MeasurementsScreen,
    },
    config
);

LinksStack.navigationOptions = {
    tabBarLabel: 'Mediciones',
    tabBarIcon: ({focused}) => (
        <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-speedometer' : 'md-speedometer'}/>
    ),
};

LinksStack.path = '';

const tabNavigator = createBottomTabNavigator({
        HomeStack,
        LinksStack,
    },
    {
        tabBarOptions: {
            inactiveBackgroundColor: '#00B050',
            activeBackgroundColor: '#00B050',
            activeTintColor: '#FFFFFF',
            inactiveTintColor: '#CCC',
            indicatorStyle:{
                backgroundColor: '#FFF'
            }
        },
        style: {
            background: '#00B050'
        }
    }
);


tabNavigator.path = '';

export default tabNavigator;
