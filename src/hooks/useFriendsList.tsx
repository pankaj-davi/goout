import { useEffect, useMemo, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface Ifriends {
  addedAt: any;
  id: string;
  requestState: string;
  uid: string;
}

// Define an interface for the hook's return type
export interface UseFriendsListResult {
  friends: Ifriends[];
  loading: boolean;
  error: Error | null;
}

export const useFriendsList = (): UseFriendsListResult => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user.uid) {
      setFriends([]); // Reset friends if no user.uid
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('friends')
      .onSnapshot(
        (snapshot) => {
          const friendsList: any[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<any, 'id'>), // Exclude id from doc.data() type assertion
          }));
          setFriends(friendsList);
          setLoading(false); // Set loading to false after fetching
        },
        (err) => {
          console.error('Error fetching friends:', err);
          setError(err); // Set error state
          setLoading(false); // Ensure loading is false even if there's an error
        }
      );

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, [user.uid]);

  // Memoize the friends list to prevent unnecessary re-renders
  const memoizedFriends = useMemo(() => friends, [friends]);

  return { friends: memoizedFriends, loading, error };
};
