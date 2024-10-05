// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen/LoginScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import { requestNotificationPermission } from './src/utils/notificationPermissions'; // New import
import {
  createNotificationChannel,
  setupForegroundNotificationHandler,
  setupBackgroundNotificationHandler,
} from './src/utils/pushNotificationService'; // New import

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
    const initializeNotifications = async () => {
      await requestNotificationPermission(); // Request permission
      createNotificationChannel(); // Create notification channel
      const unsubscribeForeground = setupForegroundNotificationHandler(); // Handle foreground messages
      setupBackgroundNotificationHandler(); // Handle background messages

      // Cleanup on unmount
      return () => {
        unsubscribeForeground();
      };
    };

    initializeNotifications();
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
