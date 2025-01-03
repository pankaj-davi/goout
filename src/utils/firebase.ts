import { useEffect, useMemo, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import Geolocation from '@react-native-community/geolocation';
import { IUser } from '../../src/context/AuthContext';
import { sendCustomPushNotification } from './pushNotificationService';
import { useAuth } from '../context/AuthContext'; // Importing useAuth to get user context

import { UserOnboardDetails } from '../screens/OnboardingScreen/OnboardingScreen';

// Helper to update Firestore documents
const updateFirestoreDoc = async (
  userUid: string,
  collectionName: string,
  docUid: string,
  data: object
) => {
  return firestore()
    .collection('users')
    .doc(userUid)
    .collection(collectionName)
    .doc(docUid)
    .set({
      ...data,
      addedAt: firestore.FieldValue.serverTimestamp(),
    });
};

// Helper to remove Firestore documents
const removeFirestoreDoc = async (
  userUid: string,
  collectionName: string,
  docUid: string
) => {
  return firestore()
    .collection('users')
    .doc(userUid)
    .collection(collectionName)
    .doc(docUid)
    .delete();
};

// Send a notification to the user
const sendUserNotification = async (
  sender: IUser,
  receiver: IUser,
  action: 'friendRequest' | 'friendRequestAccepted'
) => {
  if (receiver.deviceToken) {
    let title, body;

    switch (action) {
      case 'friendRequest':
        title = `${sender.name} sent you a friend request!`;
        body = `You have received a friend request from ${sender.name}.`;
        break;
      case 'friendRequestAccepted':
        title = `${sender.name} accepted your friend request!`;
        body = `You and ${sender.name} are now friends!`;
        break;
      default:
        throw new Error('Invalid action type');
    }

    try {
      await sendCustomPushNotification(
        receiver.deviceToken,
        title,
        body,
        sender.photo || ''
      );
    } catch (notificationError) {
      console.error(
        'Failed to send push notification:#### ',
        notificationError
      );
    }
  }
};

// Fetch user subcollection
export const fetchUserSubCollection = (
  subcollection: 'connections' | 'friends'
) => {
  const { user } = useAuth(); // Get user from context
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !user.uid) {
      setData([]); // Reset data if no user.uid
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .collection(subcollection) // Use dynamic subcollection here
      .onSnapshot(
        (snapshot) => {
          const subCollectionList: any[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<any, 'id'>), // Exclude id from doc.data() type assertion
          }));
          setData(subCollectionList);
          setLoading(false); // Set loading to false after fetching
        },
        (err) => {
          console.error('Error fetching subcollection:', err);
          setError(err); // Set error state
          setLoading(false); // Ensure loading is false even if there's an error
        }
      );

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, [user?.uid, subcollection]); // Add subcollection as a dependency

  // Memoize the data list to prevent unnecessary re-renders
  const memoizedData = useMemo(() => data, [data]);

  return { data: memoizedData, loading, error };
};

// Add a friend request
export const addFriendRequest = async (
  currentUser: IUser,
  friendSelectedUser: IUser
) => {
  try {
    // Update friend's 'connections' subcollection with the request state
    await updateFirestoreDoc(
      friendSelectedUser.uid,
      'connections',
      currentUser.uid,
      {
        ...currentUser,
        requestState: 'ReceivedRequest',
      }
    );

    // Update current user's 'connections' subcollection
    await updateFirestoreDoc(
      currentUser.uid,
      'connections',
      friendSelectedUser.uid,
      {
        ...friendSelectedUser,
        requestState: 'RequestSent',
      }
    );

    // Trigger notification to the friend
    await sendUserNotification(
      currentUser,
      friendSelectedUser,
      'friendRequest'
    );
  } catch (error) {
    console.error('Error sending friend request: ', error);
    throw new Error(JSON.stringify(error));
  }
};

// Accept a friend request
export const AcceptFriendRequest = async (
  currentUser: IUser,
  friendData: IUser
) => {
  console.log(currentUser, '$$$$$$$$$$$$$$$$$$$$', friendData);
  try {
    // Add friend to current user's 'friends' collection
    await updateFirestoreDoc(currentUser.uid, 'friends', friendData.uid, {
      ...friendData,
      requestState: 'Accepted',
    });

    // Add current user to friend's 'friends' collection
    await updateFirestoreDoc(friendData.uid, 'friends', currentUser.uid, {
      ...currentUser,
      requestState: 'Accepted',
    });

    // Remove friend from current user's 'connections' subcollection
    await removeFirestoreDoc(currentUser.uid, 'connections', friendData.uid);

    // Optionally, remove current user from friend's 'connections' subcollection
    await removeFirestoreDoc(friendData.uid, 'connections', currentUser.uid);

    // Trigger notification to the friend indicating acceptance
    await sendUserNotification(
      currentUser,
      friendData,
      'friendRequestAccepted'
    );
  } catch (error) {
    console.error('Error accepting friend request: ', error);
  }
};

// Reject a friend request
export const RejectFriendRequest = async (
  currentUser: IUser,
  friendData: IUser
) => {
  try {
    // Optional: If you want to store the rejection, you can update the state of the friend request
    // Update friend request to 'Rejected' in the current user's 'connections' collection
    await updateFirestoreDoc(currentUser.uid, 'connections', friendData.uid, {
      ...friendData,
      requestState: 'Rejected',
    });

    // Optionally, update the state in the friend's 'connections' collection as well
    await updateFirestoreDoc(friendData.uid, 'connections', currentUser.uid, {
      ...currentUser,
      requestState: 'Rejected',
    });

    // Remove the rejected friend request from the current user's 'connections' collection
    await removeFirestoreDoc(currentUser.uid, 'connections', friendData.uid);

    // Optionally, remove the current user from the friend's 'connections' collection
    await removeFirestoreDoc(friendData.uid, 'connections', currentUser.uid);
  } catch (error) {
    console.error('Error rejecting friend request: ', error);
  }
};

// Withdraw a friend request
export const WithdrawFriendRequest = async (
  currentUser: IUser,
  friendData: IUser
) => {
  try {
    // Remove the friend request from current user's 'connections' collection
    await removeFirestoreDoc(currentUser.uid, 'connections', friendData.uid);

    // Optionally, remove the friend request from the friend's 'connections' collection
    await removeFirestoreDoc(friendData.uid, 'connections', currentUser.uid);
  } catch (error) {
    console.error('Error withdrawing friend request: ', error);
  }
};

// Function to fetch all users with location
export const fetchAllUsersWithLocation = async () => {
  try {
    const usersSnapshot = await firestore().collection('users').get();
    const usersWithLocation = usersSnapshot.docs.map((doc) => doc.data());
    return usersWithLocation;
  } catch (error: any) {
    throw new Error(`Error fetching users with location: ${error.message}`);
  }
};

// Function to get current position
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
      },
      (error) => {
        console.error(error);
        reject(
          new Error('Unable to get current location. Please try again later.')
        );
      },
      {
        enableHighAccuracy: true, // Ensure high accuracy for better location
      }
    );
  });
};

// Function to save or update user location
export const saveUserLocation = async (
  user: IUser,
  latitude: number,
  longitude: number
) => {
  if (user) {
    try {
      const userDocRef = firestore().collection('users').doc(user.uid);
      const doc = await userDocRef.get();
      if (!doc.exists) {
        await userDocRef.set({
          ...user,
          location: { latitude, longitude },
        });
        console.log('User details saved successfully', user);
      } else {
        await userDocRef.update({
          location: { latitude, longitude },
        });
        console.log('User location updated successfully');
      }
    } catch (error) {
      throw new Error(`Error saving user location: ${(error as any).message}`);
    }
  }
};

export const updateUserProfileToFirestore = async (
  userOnboardDetails: UserOnboardDetails
) => {
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
