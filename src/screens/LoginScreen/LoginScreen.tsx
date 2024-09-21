// screens/LoginScreen.tsx
import React from 'react';
import {Button, View, Text, StyleSheet} from 'react-native';
import LogoIcon from '../../assets/logo-icon.svg';
import {useAuth} from '../../context/AuthContext';

const LoginScreen: React.FC = () => {
  const {login} = useAuth();

  return (
    <View style={styles.container}>
      <Text>Login Screen</Text>
      <LogoIcon style={styles.logo} />
      <Button title="Sign in with Google" onPress={login} />
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
});
