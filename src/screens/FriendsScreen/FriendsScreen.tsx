import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FriendsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Friends Screen</Text>
    </View>
  );
};

export default FriendsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
