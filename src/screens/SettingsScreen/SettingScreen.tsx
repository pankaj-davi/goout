import React from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';

const SettingScreen = () => {
  const { logout } = useAuth();
  return (
    <View style={styles.container}>
      <Text>{'SettingScreen'}</Text>
      <Button title="Logout" onPress={() => logout()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'red',
  },
});

export default SettingScreen;
