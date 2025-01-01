import { firebase } from '@react-native-firebase/firestore';
import { UserDetails } from 'src/screens/OnboardingScreen/OnboardingScreen';

export const updateUserProfileToFirestore = async (
  profileData: UserDetails
) => {
  try {
    if (!firebase.auth().currentUser) {
      throw new Error('User not authenticated');
    }
    const userRef = firebase
      .firestore()
      .collection('users')
      .doc(firebase.auth().currentUser?.uid)
      .set({ ...profileData, isOnBoarded: true }, { merge: true });
    return userRef;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
