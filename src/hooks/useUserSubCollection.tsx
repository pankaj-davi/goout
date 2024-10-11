import { useEffect, useMemo, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { IUser, useAuth } from '../context/AuthContext';

export interface UseUserSubCollectionResult {
  data: any[];
  loading: boolean;
  error: Error | null;
}

export const useUserSubCollection = (
  subcollection: 'connections' | 'friends'
): UseUserSubCollectionResult => {
  const { user } = useAuth();
  const [data, setData] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user.uid) {
      setData([]);
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .collection(subcollection)
      .onSnapshot(
        (snapshot) => {
          const subCollectionList: IUser[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<IUser, 'id'>),
          }));
          setData(subCollectionList);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching subcollection:', err);
          setError(err);
          setLoading(false);
        }
      );

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, [user.uid, subcollection]); // Add subcollection as a dependency

  const memoizedData = useMemo(() => data, [data]);

  return { data: memoizedData, loading, error };
};
