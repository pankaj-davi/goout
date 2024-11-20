import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import LoginScreen from './src/screens/LoginScreen/LoginScreen';
import HomeScreen from './src/screens/HomeScreen/HomeScreen';
import RequestScreen from './src/screens/RequestScreen/RequestScreen';
import FriendsScreen from './src/screens/FriendsScreen/FriendsScreen';
import ChatScreen from './src/screens/ChatScreen/ChatScreen';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { requestNotificationPermission } from './src/utils/notificationPermissions';
import { requestLocationPermission } from './src/utils/permissions';
import {
  createNotificationChannel,
  setupForegroundNotificationHandler,
  setupBackgroundNotificationHandler,
} from './src/utils/pushNotificationService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/** Utility Functions **/

// Create Drawer Icon
const createIcon = (name: string) => {
  return ({ color, size }: { color: string; size: number }) => (
    <Icon name={name} color={color} size={size} />
  );
};

// Create Back Button
const createBackButton = (navigation: any) => (
  <Icon
    name="arrow-back-outline"
    size={25}
    color="black"
    style={{ marginLeft: 15 }}
    onPress={() => navigation.goBack()}
  />
);

// Screen Options for Stack Navigator
const createScreenOptions = (navigation: any, showBackIcon: boolean): any => ({
  headerLeft: () => showBackIcon && createBackButton(navigation),
  headerTitleAlign: 'start',
});

/** Navigators **/

// Stack Navigator
const StackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MainTabs"
      component={TabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ChatScreen"
      component={ChatScreen}
      options={({ navigation }) => ({
        headerShown: true,
        headerTitle: 'Chat',
        ...createScreenOptions(navigation, true),
      })}
    />
  </Stack.Navigator>
);

// Tab Navigator
const TabNavigator = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="Login"
          key="Login"
          component={LoginScreen}
          options={{
            tabBarStyle: { display: 'none' },
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    );
  }

  const tabScreens = [
    {
      name: 'Home',
      component: HomeScreen,
      icon: 'home-outline',
      headerShown: false,
    },
    {
      name: 'Requests',
      component: RequestScreen,
      icon: 'mail-outline',
      headerShown: true,
    },
    {
      name: 'Friends',
      component: FriendsScreen,
      icon: 'people-outline',
      headerShown: true,
    },
    {
      name: 'Settings',
      component: FriendsScreen,
      icon: 'settings-outline',
      headerShown: true,
    },
  ];

  return (
    <Tab.Navigator>
      {tabScreens.map(({ name, component, icon, headerShown }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
          options={({ navigation }) => ({
            tabBarIcon: createIcon(icon),
            headerShown,
            ...(headerShown ? createScreenOptions(navigation, false) : {}),
          })}
        />
      ))}
    </Tab.Navigator>
  );
};

/** Main App Components **/

const MainApp = () => {
  const { isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
};

// Permission Initialization
const useInitializePermissions = () => {
  useEffect(() => {
    const initPermissions = async () => {
      const notificationPermission = await requestNotificationPermission();
      if (!notificationPermission) {
        Alert.alert(
          'Notification Permission Denied',
          'You will not receive notifications.'
        );
      }

      const locationPermission = await requestLocationPermission();
      if (!locationPermission) {
        Alert.alert(
          'Location Permission Denied',
          'This app needs access to your location for full functionality.'
        );
      }

      createNotificationChannel();

      const unsubscribeForeground = setupForegroundNotificationHandler();
      setupBackgroundNotificationHandler();

      return () => {
        unsubscribeForeground();
      };
    };

    initPermissions();
  }, []);
};

/** App Component **/

const App = () => {
  useInitializePermissions();

  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

/** Styles **/

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
