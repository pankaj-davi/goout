import React, { useCallback } from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen/HomeScreen';

const Drawer = createDrawerNavigator();

// Custom drawer content to show user profile and other items
const CustomDrawerContent: React.FC<DrawerContentComponentProps> = React.memo(
  (props) => {
    return (
      <DrawerContentScrollView {...props}>
        <View style={styles.userProfile}>
          <Text style={styles.profileText}>User Name</Text>
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    );
  }
);

const DrawerNavigator: React.FC = () => {
  // Drawer icon renderer as a separate function for reusability
  const renderDrawerIcon = useCallback(
    (name: string) =>
      ({ color, size }: any) => <Icon name={name} color={color} size={size} />,
    []
  );

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
        // drawerActiveTintColor: '#0000ff',
        // drawerInactiveTintColor: '#808080',
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerIcon: renderDrawerIcon('home-outline'),
          headerShown: false,
        }}
      />
      {/* Add other screens here if needed */}
    </Drawer.Navigator>
  );
};

// Styles
const styles = StyleSheet.create({
  userProfile: {
    // padding: 20,
    // backgroundColor: '#eee',
  },
  profileText: {
    // fontSize: 18,
    // fontWeight: 'bold',
  },
});

export default DrawerNavigator;
