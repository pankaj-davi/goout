import React from 'react';
import { useUserSubCollection } from '../../hooks/useUserSubCollection';
import { useAuth } from '../../context/AuthContext';
import ListWrapper from '../../components/ListWrapper';
import FriendItem from '../../components/FriendItem';
import { AcceptFriendRequest, RejectFriendRequest } from '../../utils/firebase';

const ReceivedScreen: React.FC = ({ ...props }) => {
  const { user, logout } = useAuth();
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
      {...props}
      loading={loading}
      error={error}
      data={friendRequestStatus}
      renderItem={({ item }) => (
        <FriendItem
          key={item.uid}
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
