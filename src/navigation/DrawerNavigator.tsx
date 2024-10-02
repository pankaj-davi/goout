import React, { useCallback } from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import FriendsScreen from '../screens/FriendsScreen/FriendsScreen';
import ReceivedScreen from '../screens/ReceivedScreen/ReceivedScreen'; // Import your Received Screen
import SentScreen from '../screens/SentScreen/SentScreen'; // Import your Sent Screen
import { useAuth } from '../context/AuthContext';

const Drawer = createDrawerNavigator();

// Memoized Custom Drawer Content
const CustomDrawerContent: React.FC<DrawerContentComponentProps> = React.memo(
  ({ navigation, ...props }) => {
    const { logout, user } = useAuth(); // Destructure user from context

    return (
      <View style={{ flex: 1 }}>
        <DrawerContentScrollView {...props}>
          <View style={styles.userProfile}>
            {user.photo ? (
              <Image source={{ uri: user.photo }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
            <Text style={styles.profileName}>{user.name || 'User Name'}</Text>
          </View>
          <DrawerItemList navigation={navigation} {...props} />
        </DrawerContentScrollView>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }
);

const DrawerNavigator: React.FC = () => {
  // Drawer icon renderer function
  const renderDrawerIcon = useCallback((name: string) => {
    return ({ color, size }: { color: string; size: number }) => (
      <Icon name={name} color={color} size={size} />
    );
  }, []);

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#f5f5f5',
        },
        drawerLabelStyle: {
          fontSize: 18,
        },
      }}
    >
      {/* Home Screen */}
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerIcon: renderDrawerIcon('home-outline'),
          headerShown: false,
        }}
      />
      {/* My Friends Screen */}
      <Drawer.Screen
        name="My Friends"
        component={FriendsScreen}
        options={{
          drawerIcon: renderDrawerIcon('people-outline'),
          headerShown: true,
          headerTitle: 'Friends',
          headerStyle: styles.headerStyle, // Use defined styles
        }}
      />
      {/* New Screens for Received and Sent Requests with similar styling */}
      <Drawer.Screen
        name="Received"
        component={ReceivedScreen}
        options={{
          drawerIcon: renderDrawerIcon('mail-unread'),
          headerShown: true,
          headerTitle: 'Received Requests',
          headerStyle: styles.headerStyle,
        }}
      />
      <Drawer.Screen
        name="Sent"
        component={SentScreen}
        options={{
          drawerIcon: renderDrawerIcon('mail'),
          headerShown: true,
          headerTitle: 'Send Requests',
          headerStyle: styles.headerStyle,
        }}
      />
    </Drawer.Navigator>
  );
};

// Styles
const styles = StyleSheet.create({
  userProfile: {
    padding: 20,
    alignItems: 'flex-start',
  },
  profileImage: {
    width: 70, // Size of the profile image
    height: 70,
    borderRadius: 35, // Circular image
    marginBottom: 10,
  },
  profileImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ccc', // Placeholder background color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeholderText: {
    color: '#666',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  logoutButton: {
    padding: 15,
    margin: 10,
    borderRadius: 5,
    backgroundColor: '#ff6347', // Change to your preferred color
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff', // Text color
    fontSize: 16,
  },
  headerStyle: {
    elevation: 6, // For Android shadow
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: {
      width: 0, // Horizontal offset
      height: 2, // Vertical offset
    },
    shadowOpacity: 0.9, // Shadow opacity
    shadowRadius: 4, // Shadow blur radius
  },
});

export default DrawerNavigator;
