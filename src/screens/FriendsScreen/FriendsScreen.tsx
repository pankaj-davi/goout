import React from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native';

import { IUser, useAuth } from '../../../src/context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useUserSubCollection } from '../../hooks/useUserSubCollection';

import ListWrapper from '../../components/ListWrapper';

const FriendsScreen: React.FC = () => {
  const { user } = useAuth();

  const navigation = useNavigation();
  const { error, data: friends, loading } = useUserSubCollection('friends');
  const currentUserId = user.uid;
  const handleFriendPress = (friendUid: string, friendName: string) => {
    const chatId = [currentUserId, friendUid].sort().join('_');
    //@ts-ignore
    navigation.navigate('ChatScreen', { chatId, friendName });
  };

  const renderItem = ({ item }: { item: IUser }) => (
    <TouchableOpacity
      onPress={() => handleFriendPress(item.uid, item.name)}
      style={styles.friendItem}
    >
      <Image source={{ uri: item.photo }} style={styles.icon} />
      <View style={styles.friendDetails}>
        <Text style={styles.name}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
  return (
    <ListWrapper
      loading={loading}
      error={error}
      data={friends}
      renderItem={renderItem}
      keyExtractor={(item) => item.uid}
    />
  );
};

export default FriendsScreen;

const styles = StyleSheet.create({
  friendItem: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 10,
    paddingLeft: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#CECBCB',
    shadowColor: '#000',
    shadowOpacity: 0.2,
  },
  icon: {
    width: 55,
    height: 55,
    borderRadius: 50,
    marginRight: 10,
  },
  friendDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
});
