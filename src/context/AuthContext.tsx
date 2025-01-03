import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
  statusCodes,
  SignInResponse,
} from '@react-native-google-signin/google-signin';
import { FIRE_BASE_CLIENT_ID } from '@env';

import messaging from '@react-native-firebase/messaging';

interface GoogleUserInfo {
  idToken?: string;
  accessToken?: string;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  GoogleSigninLogin: () => void;
  logout: () => void;
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  signInWithEmailAndPassword: (email: string, password: string) => void;
  createUserWithEmailAndPassword: (email: string, password: string) => void;
}

export interface IUser {
  uid: string;
  name: string | '';
  photo: string | '';
  email: string | null;
  photoURL: string | null;
  deviceToken: string;
  isNewUser: boolean;
  isOnBoarded: boolean;
  phoneNumber?: string;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('users');
        if (userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error retrieving user data from storage:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkUserStatus();

    const unsubscribe = auth().onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = firestore()
        .collection('users')
        .doc(user.uid)
        .onSnapshot((doc) => {
          if (doc.exists) {
            setUser((prev) => (prev ? { ...prev, ...doc.data() } : null));
          }
        });
      return () => unsubscribe();
    }
  }, [user?.uid]);

  GoogleSignin.configure({
    webClientId: FIRE_BASE_CLIENT_ID,
  });

  const saveUserDataToFirestore = async (userData: IUser) => {
    try {
      console.log('Starting to save user data to Firestore...');
      const userDocRef = firestore().collection('users').doc(userData.uid);
      console.log('User document reference obtained:', userDocRef.id);
      const doc = await userDocRef.get();
      console.log(
        'User document fetched:',
        doc.exists ? 'exists' : 'does not exist'
      );
      if (!doc.exists) {
        console.log('User document does not exist. Creating new document...');
        await userDocRef.set(userData);
        console.log('User document created successfully');
      } else {
        console.log('User document exists. Updating document...');
        await userDocRef.update(userData);
        console.log('User document updated successfully');
      }
      console.log('User data saved to Firestore successfully');
    } catch (err) {
      console.error('Error saving user data to Firestore:', err);
      throw err;
    }
  };

  const saveUserDataToStorage = async (userData: IUser) => {
    try {
      await AsyncStorage.setItem('users', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data to storage:', error);
    }
  };

  const GoogleSigninLogin = async () => {
    setIsAuthLoading(true);
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const userInfo: SignInResponse = await GoogleSignin.signIn();
      const { idToken } = userInfo.data as GoogleUserInfo;

      if (!idToken) throw new Error('Failed to get ID token');

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential =
        await auth().signInWithCredential(googleCredential);

      const { additionalUserInfo, user } = userCredential;
      if (additionalUserInfo && additionalUserInfo.profile) {
        const { profile } = additionalUserInfo;

        const deviceToken = await messaging().getToken();

        const userInfoToStore: IUser = {
          uid: user.uid,
          name: user.displayName || profile.given_name || '',
          email: user.email || profile.email || '',
          photo: user.photoURL || profile.picture || '',
          photoURL: user.photoURL || profile.picture || '',
          isNewUser: additionalUserInfo.isNewUser || false,
          isOnBoarded: false,
          deviceToken,
        };

        setIsAuthenticated(true);
        setUser(userInfoToStore);

        const userDocRef = firestore().collection('users').doc(user.uid);
        const doc = await userDocRef.get();

        if (!doc.exists) {
          await userDocRef.set(userInfoToStore);
        } else {
          const existingData = doc.data() || {};
          const updatedData = { ...existingData };

          Object.keys(userInfoToStore).forEach((key) => {
            if (userInfoToStore[key as keyof IUser]) {
              updatedData[key] = userInfoToStore[key as keyof IUser];
            }
          });

          await userDocRef.update(updatedData);
        }

        await saveUserDataToStorage(userInfoToStore);
      }

      console.log('User signed in successfully');
    } catch (err: unknown) {
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await auth().signOut();
      await GoogleSignin.signOut();
      setIsAuthenticated(false);
      setUser(null);
      await AsyncStorage.removeItem('users'); // Clear user data from AsyncStorage
    } catch (error) {
      console.error(
        'Logout Error:',
        error instanceof Error ? error.message : error
      );
      throw error; // Throw the error after logging it
    }
  };

  const signInWithEmailAndPassword = async (
    email: string,
    password: string
  ) => {
    setIsAuthLoading(true);
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;
      if (user.emailVerified) {
        // get that user from firestore by uid
        const userDoc = await firestore()
          .collection('users')
          .doc(user.uid)
          .get();
        const userData = userDoc.data() as IUser;
        const userInfoToStore: IUser = {
          uid: user.uid,
          name: user.displayName || userData.name,
          email: user.email,
          photo: user.photoURL || userData.photo,
          photoURL: user.photoURL || userData.photo,
          isNewUser: userData.isNewUser,
          isOnBoarded: userData.isOnBoarded,
          phoneNumber: user.phoneNumber || userData.phoneNumber,
          deviceToken: userData.deviceToken,
        };

        setIsAuthenticated(true);
        setUser(userInfoToStore);

        // await saveUserDataToFirestore(userInfoToStore);
        await saveUserDataToStorage(userInfoToStore);
      } else {
        await user.sendEmailVerification();
        throw new Error('Email not verified. Please check your inbox.');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const createUserWithEmailAndPassword = async (
    email: string,
    password: string
  ) => {
    setIsAuthLoading(true);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      const deviceToken = await messaging().getToken();
      const user = userCredential.user;

      await user.sendEmailVerification();
      console.log('Verification email sent! Please check your inbox.');

      const userInfoToStore: IUser = {
        uid: user.uid,
        name: user.displayName || '',
        email: user.email,
        photo: user.photoURL || '',
        photoURL: user.photoURL || '',
        isNewUser: true,
        isOnBoarded: false,
        phoneNumber: user.phoneNumber || '',
        deviceToken: deviceToken || '',
      };

      await saveUserDataToFirestore(userInfoToStore);

      await logout();

      // Throw an error to be caught by the calling component
      throw new Error('Verification email sent! Please check your inbox.');
    } catch (error) {
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthLoading,
        GoogleSigninLogin,
        logout,
        user,
        setUser,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
