import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const updateUserProfileToFirestore = async (userOnboardDetails: any) => {
  try {
    const currentUser = auth().currentUser;

    // Check if the user is authenticated
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Reference to the user document
    const userRef = firestore().collection('users').doc(currentUser.uid);

    // Update the document with merge
    await userRef.set(
      { ...userOnboardDetails, isOnBoarded: true },
      { merge: true }
    );

    console.log('User profile successfully updated');

    // Fetch and log the document fields
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      const fields = userDoc.data();
      return fields; // Return fields if needed
    } else {
      console.log('No document data found for this user.');
      return null;
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
