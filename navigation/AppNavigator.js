import React from 'react';
import {createAppContainer, createStackNavigator} from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import BTManagementScreen from '../screens/BTManagementScreen';
import BTDevicesScreen from '../screens/BTDevicesScreen';

export default createAppContainer(
    createStackNavigator({
            // You could add another route here for authentication.
            // Read more at https://reactnavigation.org/docs/en/auth-flow.html
            Main: {
                screen: MainTabNavigator,
                navigationOptions: {
                    header: null
                }
            },
            BTManagement: {
                screen: BTManagementScreen,
                navigationOptions: {
                    header: null,
                }
            },
            BTDevicesScreen: {
                screen: BTDevicesScreen,
                navigationOptions: {
                    headerTitle: 'Selecciona la sonda',
                    headerStyle: {
                        backgroundColor: '#00B050',
                    },
                    headerTintColor: '#FFF'
                }
            }

        },
    )
);
