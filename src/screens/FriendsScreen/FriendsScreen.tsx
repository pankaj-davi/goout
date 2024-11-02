import React from 'react';
import { useUserSubCollection } from '../../hooks/useUserSubCollection';
import ListWrapper from '../../components/ListWrapper';
import FriendItem from '../../components/FriendItem';
import { IUser, useAuth } from '../../../src/context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const FriendsScreen: React.FC = () => {
  const { user } = useAuth();

  const navigation = useNavigation();
  const { error, data: friends, loading } = useUserSubCollection('friends');
  const currentUserId = user.uid;
  const handleFriendPress = (friendUid: string, friendName: string) => {
    const chatId = [currentUserId, friendUid].sort().join('_');
    navigation.navigate('ChatScreen', { chatId, friendName });
  };

  return (
    <ListWrapper
      loading={loading}
      error={error}
      data={friends}
      renderItem={({ item }: { item: IUser }) => (
        <FriendItem
          photo={item.photo}
          name={item.name}
          uid={item.uid}
          onPress={() => handleFriendPress(item.uid, item.name)}
        />
      )}
      keyExtractor={(item) => item.uid}
    />
  );
};

export default FriendsScreen;
