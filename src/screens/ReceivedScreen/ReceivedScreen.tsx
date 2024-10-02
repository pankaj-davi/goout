import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ReceivedScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>ReceivedScreen </Text>
    </View>
  );
};

export default ReceivedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
