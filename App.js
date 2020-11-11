import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import MainScreen from './screens/MainScreen';

const mainFlow = createStackNavigator({
  mainFlow: MainScreen,
});
const switchNavigator = createSwitchNavigator({
  main: createStackNavigator({
    mainFlow: {screen: MainScreen, navigationOptions: { headerShown:false }},
  })
});

const App = createAppContainer(switchNavigator);

export default () => {
  return <App/>
}
