import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import MainScreen from './Screens/MainScreen';
import MovieDetailScreen from './Screens/MovieDetailScreen';
import UserProfileScreen from './Screens/UserProfileScreen';

const mainFlow = createStackNavigator({
  mainFlow: MainScreen,
  detail: MovieDetailScreen
});
const switchNavigator = createSwitchNavigator({
  main: createStackNavigator({
    mainFlow: {screen: MainScreen, navigationOptions: { headerShown:false }},
    detail: {screen: MovieDetailScreen, navigationOptions: { headerShown:false }},
  })
});

const App = createAppContainer(switchNavigator);

export default () => {
  return <App/>
}
