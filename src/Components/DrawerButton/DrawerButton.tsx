import React from 'react';
import { StyleSheet, Image, TouchableOpacity } from 'react-native';

// Replace DrawerButton component
const DrawerButton = ({
  navigation,
  userPhoto,
}: {
  navigation: any;
  userPhoto: string | undefined;
}) => {
  return (
    <TouchableOpacity
      onPress={() => navigation.openDrawer()}
      style={styles.drawerButton}
    >
      <Image
        source={{
          uri: userPhoto || 'https://example.com/default-avatar.png', // Default avatar URL
        }}
        style={styles.userIcon}
      />
    </TouchableOpacity>
  );
};

// Add styles for the user icon with a border
const styles = StyleSheet.create({
  drawerButton: {
    position: 'absolute',
    top: 20,
    left: 10,
    zIndex: 1000,
  },
  userIcon: {
    width: 50, // Set the width of the icon
    height: 50, // Set the height of the icon
    borderRadius: 30, // Make it circular
    borderWidth: 2, // Border width
    borderColor: 'green', // Border color
  },
});

export default DrawerButton;
