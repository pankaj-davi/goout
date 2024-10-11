import React from 'react';
import { useUserSubCollection } from '../../hooks/useUserSubCollection';
import { useAuth } from '../../context/AuthContext';
import ListWrapper from '../../Components/ListWrapper';
import FriendItem from '../../Components/FriendItem';
import { WithdrawFriendRequest } from '../../utils/firebase';

const SendScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    error,
    data: connections,
    loading,
  } = useUserSubCollection('connections');

  const friendRequestStatus = connections.filter(
    ({ requestState }) => requestState === 'RequestSent'
  );

  return (
    <ListWrapper
      loading={loading}
      error={error}
      data={friendRequestStatus}
      renderItem={({ item }: any) => (
        <FriendItem
          photo={item.photo}
          name={item.name}
          onWithdraw={() => WithdrawFriendRequest(user, item)}
        />
      )}
      keyExtractor={(item) => item.uid}
    />
  );
};

export default SendScreen;
