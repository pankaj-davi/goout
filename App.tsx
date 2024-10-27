// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen/LoginScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet, Alert } from 'react-native';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import { requestNotificationPermission } from './src/utils/notificationPermissions';
import { requestLocationPermission } from './src/utils/permissions'; // Import your location permission utility
import {
  createNotificationChannel,
  setupForegroundNotificationHandler,
  setupBackgroundNotificationHandler,
} from './src/utils/pushNotificationService';

const Stack = createNativeStackNavigator();

const MainApp: React.FC = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          <Stack.Screen
            name="Drawer"
            component={DrawerNavigator}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    const initializePermissions = async () => {
      const notificationPermissionGranted =
        await requestNotificationPermission();
      if (!notificationPermissionGranted) {
        Alert.alert(
          'Notification Permission Denied',
          'You will not receive notifications.'
        );
      }

      const locationPermissionGranted = await requestLocationPermission();
      if (!locationPermissionGranted) {
        Alert.alert(
          'Location Permission Denied',
          'This app needs access to your location for full functionality.'
        );
      }

      createNotificationChannel();

      const unsubscribeForeground = setupForegroundNotificationHandler();
      setupBackgroundNotificationHandler(); // Register background handler here

      return () => {
        unsubscribeForeground(); // Unsubscribe from foreground notifications
      };
    };

    initializePermissions();
  }, []);

  return (
    <AuthProvider>
      <MainApp />
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
