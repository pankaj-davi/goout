import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { TextInput } from 'react-native-gesture-handler';
import { theme } from '../../theme/index';

interface FormData {
  email: string;
  password: string;
}

const EmailLoginScreen: React.FC = () => {
  const {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    resetPassword,
  } = useAuth();
  const [isForgetPassword, setIsForgetPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    mode: 'onTouched',
    shouldFocusError: true,
  });

  const onSubmit = async (data: FormData) => {
    const { email, password } = data;
    try {
      if (isForgetPassword) {
        await resetPassword(email);
        Alert.alert(
          'Success',
          'Password reset email sent! Please check your inbox.'
        );
        setIsRegistering(false);
        ``;
      } else if (isRegistering) {
        await createUserWithEmailAndPassword(email, password);
      } else {
        await signInWithEmailAndPassword(email, password);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'An unknown error occurred.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Email</Text>
      <Controller
        name="email"
        control={control}
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Invalid email address',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ position: 'relative', marginBottom: 16 }}>
            <TextInput
              style={[styles.input, errors.email && styles.errorInput]}
              placeholder="Email"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>
        )}
      />
      {!isForgetPassword && (
        <>
          <Text style={styles.subtitle}>Password</Text>
          <Controller
            name="password"
            control={control}
            rules={{
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters long',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={{ position: 'relative', marginBottom: 16 }}>
                <TextInput
                  style={[styles.input, errors.password && styles.errorInput]}
                  placeholder="Password"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password.message}
                  </Text>
                )}
              </View>
            )}
          />
          <Text
            onPress={() => setIsForgetPassword(true)}
            style={styles.forgotPassword}
          >
            Forgot Password?
          </Text>
        </>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>
            {isForgetPassword
              ? 'Forget Password'
              : isRegistering
                ? 'Register'
                : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
      {!isForgetPassword && (
        <Text
          onPress={() => setIsRegistering(!isRegistering)}
          style={styles.toggle}
        >
          {isRegistering ? 'Back to Login' : "Don't have an account? Register"}
        </Text>
      )}
      {isForgetPassword && (
        <Text onPress={() => setIsForgetPassword(false)} style={styles.toggle}>
          Back to Login
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'left',
    marginBottom: 2,
    fontWeight: '400',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
    color: theme.colors.text,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  errorInput: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginBottom: 10,
    position: 'absolute',
    top: 52,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: theme.colors.textLight,
    fontWeight: 'bold',
  },
  toggle: {
    marginTop: 16,
    textAlign: 'center',
    color: 'blue',
  },
  forgotPassword: {
    marginTop: -10,
    textAlign: 'right',
    color: 'blue',
  },
});

export default EmailLoginScreen;
