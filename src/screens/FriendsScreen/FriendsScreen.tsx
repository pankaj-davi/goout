import React from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native';

import { IUser, useAuth } from '../../../src/context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useUserSubCollection } from '../../hooks/useUserSubCollection';

import ListWrapper from '../../components/ListWrapper';
import { theme } from '../../theme/index';

const FriendsScreen: React.FC = () => {
  const { user } = useAuth();

  const navigation = useNavigation();
  const { error, data: friends, loading } = useUserSubCollection('friends');
  const currentUserId = user && user.uid;
  const handleFriendPress = (
    friendUid: string,
    friendName: string,
    friendImage: string,
    friendDeviceToken: string
  ) => {
    const chatId = [currentUserId, friendUid].sort().join('_');
    //@ts-ignore
    navigation.navigate('ChatScreen', {
      chatId,
      friendImage: friendImage,
      friendName: friendName,
      friendDeviceToken: friendDeviceToken,
    });
  };

  const renderItem = ({ item }: { item: IUser }) => (
    <TouchableOpacity
      onPress={() =>
        handleFriendPress(item.uid, item.name, item.photo, item.deviceToken)
      }
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
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.md,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: theme.spacing.sm,
  },
  friendDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
});
