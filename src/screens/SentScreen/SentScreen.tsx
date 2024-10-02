import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SentScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>SentScreen </Text>
    </View>
  );
};

export default SentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
