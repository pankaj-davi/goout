import React from 'react';
import { useUserSubCollection } from '../../hooks/useUserSubCollection';
import ListWrapper from '../../components/ListWrapper';
import FriendItem from '../../components/FriendItem';
import { IUser } from '../../../src/context/AuthContext';

const FriendsScreen: React.FC = () => {
  const { error, data: friends, loading } = useUserSubCollection('friends');

  return (
    <ListWrapper
      loading={loading}
      error={error}
      data={friends}
      renderItem={({ item }: { item: IUser }) => (
        <FriendItem photo={item.photo} name={item.name} />
      )}
      keyExtractor={(item) => item.uid}
    />
  );
};

export default FriendsScreen;
