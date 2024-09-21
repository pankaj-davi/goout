// App.tsx
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import 'react-native-gesture-handler';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen/LoginScreen';
import HomeScreen from './src/screens/HomeScreen/HomeScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, View, StyleSheet, Text} from 'react-native';

const Stack = createNativeStackNavigator();

function MainApp() {
  const {isAuthenticated, isAuthLoading} = useAuth();

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
            name="Home"
            component={HomeScreen}
            options={({}) => ({
              headerLeft: () => (
                // <Icon
                //   name="happy-outline" // Choose an appropriate icon
                //   size={30}
                //   color="black"
                //   style={{marginLeft: 15}}
                //   onPress={handleSayHi} // Call the function when clicked
                // />
                <View>
                  <Text>{'HI'}</Text>
                </View>
              ),
              headerTitle: '', // Hide the title
              headerStyle: {
                backgroundColor: '#f8f8f8', // Customize header background
              },
              headerTintColor: 'black', // Customize icon color
            })}
          />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
