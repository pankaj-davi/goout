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
  login: () => void;
  logout: () => void;
  user: IUser;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
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
      await firestore()
        .collection('users')
        .doc(userData.uid)
        .set(userData, { merge: true });
      console.log('User data saved to Firestore successfully');
    } catch (err) {
      console.error('Error saving user data to Firestore:', err);
    }
  };

  const saveUserDataToStorage = async (userData: IUser) => {
    try {
      await AsyncStorage.setItem('users', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data to storage:', error);
    }
  };

  const login = async () => {
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

      // Extract necessary details from the userCredential object
      const { additionalUserInfo, user } = userCredential;
      if (additionalUserInfo && additionalUserInfo.profile) {
        const { profile } = additionalUserInfo;

        const deviceToken = await messaging().getToken();

        // Mapping to the IUser interface for easy usage later
        const userInfoToStore: IUser = {
          uid: user.uid,
          name: user.displayName || profile.given_name || null, // fallback to given_name if displayName is null
          email: user.email || profile.email || '', // use the profile email as a fallback
          photo: user.photoURL || profile.picture || null, // fallback to Google profile picture
          photoURL: user.photoURL || profile.picture || null,
          isNewUser: additionalUserInfo.isNewUser || false,
          isOnBoarded: false,
          deviceToken,
        };

        // Set user and authentication state
        setIsAuthenticated(true);
        setUser(userInfoToStore);

        // if user isnwew, save the user data to Firestore
        if (additionalUserInfo.isNewUser) {
          await saveUserDataToFirestore(userInfoToStore);
        }

        // Save the user data to AsyncStorage and Firestore
        await saveUserDataToStorage(userInfoToStore);
      }

      console.log('User signed in successfully');
    } catch (err: unknown) {
      console.log(err, 'User signed in errerrerr');
      // handleError(err); // Reuse the error handler from earlier code
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
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isAuthLoading, login, logout, user, setUser }}
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
