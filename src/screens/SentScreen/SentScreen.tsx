import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { useFriendsListContext } from '../../context/FriendsListContext';

const SendScreen: React.FC = () => {
  const { loading, friends, error } = useFriendsListContext();

  // Display a loading message or error message if needed
  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error loading friends: {error.message}</Text>
      </View>
    );
  }

  // Render each friend's information
  const renderItem = ({ item }) => (
    <View style={styles.friendItem}>
      <Image source={{ uri: item.photo }} style={styles.icon} />
      <Text style={styles.name}>{item.displayName}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default SendScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  list: {
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 25, // To make the icon rounded
    marginRight: 10,
  },
  name: {
    fontSize: 18,
    color: '#000',
  },
});
