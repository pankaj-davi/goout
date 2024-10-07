import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ReceivedScreen from '../ReceivedScreen/ReceivedScreen'; // Import your Received Screen
import SentScreen from '../SentScreen/SentScreen'; // Import your Sent Screen

const Tab = createMaterialTopTabNavigator();

const RequestScreen: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Sent"
      screenOptions={{
        tabBarActiveTintColor: '#000', // Minimalist active tab color
        tabBarInactiveTintColor: '#888', // Color for inactive tabs
        tabBarStyle: { backgroundColor: '#f0f0f0' }, // Light background for the tab bar
        tabBarLabelStyle: { fontSize: 16 }, // Slightly larger and bolder font
        tabBarIndicatorStyle: { backgroundColor: '#6200ea', height: 3 }, // Minimalist indicator style
        tabBarPressColor: 'rgba(98, 0, 234, 0.2)', // Soft press color
      }}
    >
      <Tab.Screen name="Sent" component={SentScreen} />
      <Tab.Screen name="Received" component={ReceivedScreen} />
    </Tab.Navigator>
  );
};

export default RequestScreen;
