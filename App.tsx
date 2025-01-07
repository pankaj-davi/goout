import React, { useEffect } from 'react';
import { ThemeProvider } from './src/components/ThemeProvider';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Alert,
  Text,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import LoginScreen from './src/screens/LoginScreen/LoginScreen';
import HomeScreen from './src/screens/HomeScreen/HomeScreen';
import RequestScreen from './src/screens/RequestScreen/RequestScreen';
import FriendsScreen from './src/screens/FriendsScreen/FriendsScreen';
import ChatScreen from './src/screens/ChatScreen/ChatScreen';
import SettingScreen from './src/screens/SettingsScreen/SettingScreen';
import OnboardingScreen from './src/screens/OnboardingScreen/OnboardingScreen';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { requestNotificationPermission } from './src/utils/notificationPermissions';
import { requestLocationPermission } from './src/utils/permissions';
import {
  createNotificationChannel,
  setupForegroundNotificationHandler,
  setupBackgroundNotificationHandler,
  setNavigationRef,
} from './src/utils/pushNotificationService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const createIcon = (name: string) => {
  return ({ color, size }: { color: string; size: number }) => (
    <Icon name={name} color={color} size={size} />
  );
};

const createBackButton = (navigation: any) => (
  <Icon
    name="arrow-back-outline"
    size={25}
    color="black"
    style={{ marginLeft: 15 }}
    onPress={() => navigation.goBack()}
  />
);

const createScreenOptions = (navigation: any, showBackIcon: boolean): any => ({
  headerLeft: () => showBackIcon && createBackButton(navigation),
  headerTitleAlign: 'start',
});

const ChatHeader = ({ route }: { route: any }) => {
  const { friendName = 'Unknown', friendImage = '' } = route.params as {
    friendName?: string;
    friendImage?: string;
    friendDeviceToken?: string;
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={{ uri: friendImage }}
        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
      />
      <Text style={{ fontSize: 18, fontWeight: '600', color: 'black' }}>
        {friendName}
      </Text>
    </View>
  );
};

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
      options={({ navigation, route }) => ({
        headerShown: true,
        headerTitle: () => <ChatHeader route={route} />,
        ...createScreenOptions(navigation, true),
      })}
    />
  </Stack.Navigator>
);

const TabNavigator = () => {
  const { isAuthenticated, user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

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

  if (isAuthenticated && user && !user.isOnBoarded) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
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
      name: 'chats',
      component: FriendsScreen,
      icon: 'chatbox-outline',
      headerShown: true,
    },
    {
      name: 'Settings',
      component: SettingScreen,
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
    <NavigationContainer
      ref={(ref) => setNavigationRef(ref as NavigationContainerRef<any>)}
    >
      <StackNavigator />
    </NavigationContainer>
  );
};

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

const App = () => {
  useInitializePermissions();

  return (
    <AuthProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
