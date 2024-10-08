import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Image } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { IUser, useAuth } from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import UserInfoModal from '../../Components/Modal/UserInfoModal'; // Adjust the path as necessary
import DrawerButton from '../../Components/DrawerButton/DrawerButton';
import { useFriendsList } from '../../hooks/useFriendsList';

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
    borderColor: 'white',
    backgroundColor: 'black',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  currentUserMarker: {
    borderColor: 'blue',
  },
  otherUserMarker: {
    borderColor: 'green',
  },
});

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { friends } = useFriendsList();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFriendUser, setSelectedFriendUser] = useState<IUser | null>(
    null
  );

  useEffect(() => {
    fetchAllUsersWithLocation(); // Fetch users on mount
    getCurrentPosition(); // Get the initial position
    console.log('check pankaj', friends);
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
        enableHighAccuracy: false,
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
      <DrawerButton navigation={navigation} userPhoto={user.photo || ''} />
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          latitude: currentLocation?.latitude || 37.78825,
          longitude: currentLocation?.longitude || -122.4324,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
      >
        {currentLocation && (
          <Marker coordinate={currentLocation}>
            <View style={[styles.markerContainer, styles.currentUserMarker]}>
              <View style={styles.markerPin}>
                <Image
                  source={{ uri: user!.photo! }}
                  style={styles.markerImage}
                />
              </View>
            </View>
          </Marker>
        )}

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
                onPress={() => {
                  setSelectedFriendUser(otherUser);
                  setModalVisible(true);
                }}
              >
                <View style={[styles.markerContainer, styles.otherUserMarker]}>
                  <View style={styles.markerPin}>
                    <Image source={{ uri: photo }} style={styles.markerImage} />
                  </View>
                </View>
              </Marker>
            );
          }
          return null;
        })}
      </MapView>

      {/* User Info Modal */}
      <UserInfoModal
        visible={modalVisible}
        currentUser={user}
        friendSeletedUser={selectedFriendUser}
        onClose={resetModal}
      />
    </View>
  );
};
// Function to calculate the distance between two geographic points
// const calculateDistance = (
//   point1: GeoPoint | null,
//   point2: GeoPoint | null,
// ): number => {
//   if (!point1 || !point2) {
//     return Infinity; // Return a large number if either point is null
//   }

//   const toRad = (value: number): number => (value * Math.PI) / 180; // Convert degrees to radians
//   const R = 6371e3; // Radius of Earth in meters

//   const lat1 = toRad(point1.latitude);
//   const lat2 = toRad(point2.latitude);
//   const deltaLat = toRad(point2.latitude - point1.latitude);
//   const deltaLon = toRad(point2.longitude - point1.longitude);

//   const a =
//     Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
//     Math.cos(lat1) *
//       Math.cos(lat2) *
//       Math.sin(deltaLon / 2) *
//       Math.sin(deltaLon / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//   return R * c; // Distance in meters
// };
export default HomeScreen;
