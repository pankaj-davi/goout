import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { IUser } from '../../src/context/AuthContext';

interface ListWrapperProps {
  loading: boolean;
  error: Error | null;
  data: any[];
  renderItem: ({ item }: { item: IUser }) => JSX.Element;
  keyExtractor: (item: IUser) => string;
}

const ListWrapper: React.FC<ListWrapperProps> = ({
  loading,
  error,
  data,
  renderItem,
  keyExtractor,
}) => {
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
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.list}
    />
  );
};

export default ListWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 10,
  },
});
