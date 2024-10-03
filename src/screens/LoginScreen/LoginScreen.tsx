// screens/LoginScreen.tsx
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LogoIcon from '../../assets/logo-icon.svg'; // Import your SVG
import { useAuth } from '../../context/AuthContext';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.textPart}>{'G'}</Text>
        <LogoIcon />
        <Text style={styles.textPart}>{'OUT'}</Text>
      </View>

      {/* Sign-in button */}
      <GoogleSigninButton
        style={styles.googleButton}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={login}
      />
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row', // Aligns elements horizontally (text + SVG)
    alignItems: 'flex-end', // Align the text to the bottom of the SVG
    marginBottom: 40, // Space between the header and button
  },
  textPart: {
    fontSize: 60, // Font size for the text
    fontWeight: 'bold', // Bold to match the SVG logo
    color: '#000',
    shadowOpacity: 0.6, // Shadow opacity
    margin: -22, // No margins for text to avoid extra space
  },
  googleButton: {
    height: 60, // Adjust height as necessary
    marginTop: 20, // Space above the button
  },
});
