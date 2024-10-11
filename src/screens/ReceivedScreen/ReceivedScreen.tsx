import React from 'react';
import { useUserSubCollection } from '../../hooks/useUserSubCollection';
import { useAuth } from '../../context/AuthContext';
import ListWrapper from '../../components/ListWrapper';
import FriendItem from '../../components/FriendItem';
import { AcceptFriendRequest, RejectFriendRequest } from '../../utils/firebase';

const ReceivedScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    error,
    data: connections,
    loading,
  } = useUserSubCollection('connections');

  const friendRequestStatus = connections.filter(
    ({ requestState }) => requestState === 'ReceivedRequest'
  );

  return (
    <ListWrapper
      loading={loading}
      error={error}
      data={friendRequestStatus}
      renderItem={({ item }) => (
        <FriendItem
          photo={item.photo}
          name={item.name}
          onAccept={() => AcceptFriendRequest(user, item)}
          onReject={() => RejectFriendRequest(user, item)}
        />
      )}
      keyExtractor={(item) => item.uid}
    />
  );
};

export default ReceivedScreen;
