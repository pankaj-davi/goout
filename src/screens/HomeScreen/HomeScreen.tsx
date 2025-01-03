import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Image } from 'react-native';
import { colors } from '../../theme/colors';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { IUser, useAuth } from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import UserInfoModal from '../../components/Modal/UserInfoModal'; // Adjust the path as necessary
import DrawerButton from '../../components/DrawerButton/DrawerButton';

// Define GeoPoint interface
interface GeoPoint {
  latitude: number;
  longitude: number;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerPin: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 5,
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.textLight,
    backgroundColor: colors.text,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.overlay,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  currentUserMarker: {
    borderColor: colors.primaryLight,
  },
  otherUserMarker: {
    borderColor: colors.success,
  },
});

// Main component
const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFriendUser, setSelectedFriendUser] = useState<IUser | null>(
    null
  );

  useEffect(() => {
    fetchAllUsersWithLocation(); // Fetch users on mount
    getCurrentPosition(); // Get the initial position
  }, []);

  // Function to update user's current location
  const updateLocation = (latitude: number, longitude: number) => {
    setCurrentLocation({ latitude, longitude });
    saveUserLocation(latitude, longitude);
  };

  // Function to get current position
  const getCurrentPosition = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation(latitude, longitude);
      },
      (error) => {
        console.error(error);
        Alert.alert(
          'Error',
          'Unable to get current location. Please try again later.'
        );
      },
      {
        enableHighAccuracy: true, // Ensure high accuracy for better location
      }
    );
  };

  // Function to fetch all users with location
  const fetchAllUsersWithLocation = async () => {
    try {
      const usersSnapshot = await firestore().collection('users').get();
      const usersWithLocation = usersSnapshot.docs.map((doc) => doc.data());
      setAllUsers(usersWithLocation);
    } catch (error) {
      console.error('Error fetching users with location:', error);
    }
  };

  // Function to save or update user location
  const saveUserLocation = async (latitude: number, longitude: number) => {
    if (user) {
      try {
        const userDocRef = firestore().collection('users').doc(user.uid);
        const doc = await userDocRef.get();
        if (!doc.exists) {
          await userDocRef.set({
            ...user,
            location: { latitude, longitude },
          });
          console.log('User details saved successfully', user);
        } else {
          await userDocRef.update({
            location: { latitude, longitude },
          });
          console.log('User location updated successfully');
        }
      } catch (error) {
        console.error('Error saving user location:', error);
      }
    }
  };

  const resetModal = () => {
    setModalVisible(false);
    setSelectedFriendUser(null);
  };

  return (
    <View style={styles.container}>
      {/* <DrawerButton navigation={navigation} userPhoto={user.photo || ''} /> */}
      {currentLocation && (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          // liteMode={true}
          region={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          showsUserLocation={false} // Control visibility of user location button
          showsMyLocationButton={false}
          onPress={() => {
            if (modalVisible) resetModal(); // Close modal if the map is pressed
          }}
        >
          {allUsers.map((otherUser) => {
            const { location, photo, uid } = otherUser;
            if (location && location.latitude && location.longitude) {
              return (
                <Marker
                  key={uid}
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedFriendUser(otherUser);
                    setModalVisible(true);
                  }}
                >
                  <View
                    style={[styles.markerContainer, styles.otherUserMarker]}
                  >
                    <View style={styles.markerPin}>
                      <Image
                        source={{ uri: photo }}
                        style={styles.markerImage}
                      />
                    </View>
                  </View>
                </Marker>
              );
            }
            return null;
          })}
        </MapView>
      )}

      {/* User Info Modal */}
      {selectedFriendUser && user && (
        <UserInfoModal
          visible={modalVisible}
          currentUser={user}
          friendSeletedUser={selectedFriendUser}
          onClose={resetModal}
        />
      )}
    </View>
  );
};

export default HomeScreen;
