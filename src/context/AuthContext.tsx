import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import auth from '@react-native-firebase/auth';
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
  isAuthloading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthloading, setIsAuthLoading] = useState<boolean>(false); // Initialize isAuthloading state

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  GoogleSignin.configure({
    webClientId:
      '883572130459-u13r4chvsh1cknqa5ejrldcii655r51s.apps.googleusercontent.com', // Update with your webClientId
  });

  const login = async () => {
    setIsAuthLoading(true); // Set isAuthloading to true
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      const userInfo: SignInResponse = await GoogleSignin.signIn();
      const {idToken} = userInfo.data as GoogleUserInfo;

      if (!idToken) {
        throw new Error('Failed to get ID token');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
      setIsAuthenticated(true);
      console.log('User signed in successfully');
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes(statusCodes.SIGN_IN_CANCELLED)) {
          console.error('User cancelled the sign-in');
        } else if (err.message.includes(statusCodes.IN_PROGRESS)) {
          console.error('Sign-in in progress');
        } else {
          console.error('Google Sign-In Error:', err.message);
        }
      } else {
        console.error('An unknown error occurred:', err);
      }
    } finally {
      setIsAuthLoading(false); // Set isAuthloading to false after trying to login
    }
  };

  const logout = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        console.warn('No user is currently signed in');
        return;
      }

      await auth().signOut();
      await GoogleSignin.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error(
        'Logout Error:',
        error instanceof Error ? error.message : error,
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{isAuthenticated, isAuthloading, login, logout}}>
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
