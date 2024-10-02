// import { FIRE_BASE_CLIENT_ID } from 'react-native-dotenv';
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

interface GoogleUserInfo {
  idToken?: string;
  accessToken?: string;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: () => void;
  logout: () => void;
  user: IUser | null;
}

interface IUser {
  id: string;
  name: string | null;
  email: string;
  photo: string | null;
  familyName?: string | null; // Optional
  givenName?: string | null; // Optional
}

interface CustomUser {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
  familyName?: string | null;
  givenName?: string | null;
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
        const userData = await AsyncStorage.getItem('user');
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

  GoogleSignin.configure({
    webClientId: '',
  });

  const saveUserDataToFirestore = async (userData: CustomUser) => {
    console.log('User Data before saving:', userData);
    try {
      const userDoc = {
        uid: userData.uid || '',
        name: userData.displayName || null,
        email: userData.email || null,
        photo: userData.photoURL || null,
        familyName: userData.familyName || null,
        givenName: userData.givenName || null,
      };

      await firestore()
        .collection('users')
        .doc(userData.uid)
        .set(userDoc, { merge: true });
      console.log('User data saved to Firestore successfully');
    } catch (err) {
      console.error('Error saving user data to Firestore:', err);
    }
  };

  const saveUserDataToStorage = async (userData: IUser) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
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

      if (!idToken) {
        throw new Error('Failed to get ID token');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential =
        await auth().signInWithCredential(googleCredential);
      const userData = userCredential.user as CustomUser;

      const userInfoToStore: IUser = {
        id: userData.uid,
        name: userData.displayName,
        email: userData.email || '',
        photo: userData.photoURL,
        familyName: userData.familyName,
        givenName: userData.givenName,
      };

      setIsAuthenticated(true);
      setUser(userInfoToStore);
      await saveUserDataToStorage(userInfoToStore);
      await saveUserDataToFirestore(userData);

      console.log('User signed in successfully');
    } catch (err: unknown) {
      if (err instanceof Error) {
        switch (err.message) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.error('User cancelled the sign-in');
            break;
          case statusCodes.IN_PROGRESS:
            console.error('Sign-in in progress');
            break;
          default:
            console.error('Google Sign-In Error:', err.message);
        }
      } else {
        console.error('An unknown error occurred:', err);
      }
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
      await AsyncStorage.removeItem('user'); // Clear user data from AsyncStorage
    } catch (error) {
      console.error(
        'Logout Error:',
        error instanceof Error ? error.message : error
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isAuthLoading, login, logout, user }}
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
