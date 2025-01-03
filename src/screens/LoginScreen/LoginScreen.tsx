// screens/LoginScreen.tsx
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import LogoIcon from '../../assets/logo-icon.svg'; // Import your SVG
import { useAuth } from '../../context/AuthContext';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import EmailLoginScreen from './EmailLoginScreen';

const LoginScreen: React.FC = () => {
  const { GoogleSigninLogin } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.textPart}>{'G'}</Text>
        <LogoIcon />
        <Text style={styles.textPart}>{'OUT'}</Text>
      </View>

      <EmailLoginScreen />

      {/* Sign-in button */}
      <GoogleSigninButton
        style={styles.googleButton}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={() => GoogleSigninLogin()}
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
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  textPart: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: 'bold',
    color: colors.text,
    shadowOpacity: 0.6,
    margin: -22,
  },
  googleButton: {
    width: '100%',
    height: 60,
    marginTop: 20,
  },
});
