import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Image } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { useAuth } from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import DrawerButton from '../../Components/DrawerButton/DrawerButton';
import UserInfoModal from '../../Components/Modal/UserInfoModal'; // Adjust the path as necessary

interface GeoPoint {
  latitude: number;
  longitude: number;
}

interface User {
  uid: string;
  name: string;
  photo: string;
  location: GeoPoint;
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
    borderRadius: 20, // Circular shape
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'black', // Fill color for the pin
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // Add shadow for a 3D effect (optional)
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  currentUserMarker: {
    borderColor: 'blue', // Color for the current user's marker
  },
  otherUserMarker: {
    borderColor: 'green', // Color for other users' markers
  },
});

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [friendSeletedUser, setSeletedFriendUser] = useState<User | null>(null);

  // Function to update user's current location
  const updateLocation = (latitude: number, longitude: number) => {
    console.log({ latitude, longitude });
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
      { enableHighAccuracy: true }
    );
  };

  // Function to fetch all users with location
  const fetchAllUsersWithLocation = async () => {
    try {
      const usersSnapshot = await firestore()
        .collection('userWithLocation') // Ensure this matches your Firestore collection
        .get();
      const usersWithLocation: User[] = usersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.name,
          photo: data.photo,
          location: data.location,
        };
      });
      console.log(usersWithLocation, '###');
      setAllUsers(usersWithLocation);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Function to save or update user location
  const saveUserLocation = async (latitude: number, longitude: number) => {
    if (user) {
      try {
        const userDocRef = firestore()
          .collection('userWithLocation')
          .doc(user.email); // Use the user email as the document ID
        const doc = await userDocRef.get(); // Check if document exists

        if (!doc.exists) {
          await userDocRef.set({
            name: user.name || 'Unknown User',
            photo: user.photo || 'https://example.com/default-avatar.png',
            location: {
              latitude,
              longitude,
            },
          });
          console.log('User details saved successfully', user);
        } else {
          await userDocRef.update({
            location: {
              latitude,
              longitude,
            },
          });
          console.log('User location updated successfully');
        }
      } catch (error) {
        console.error('Error saving user location:', error);
      }
    }
  };

  useEffect(() => {
    getCurrentPosition(); // Get the initial position
    fetchAllUsersWithLocation(); // Fetch users only once on mount
  }, []);

  const resetModal = () => {
    setModalVisible(false);
    setSeletedFriendUser(null);
  };

  return (
    <View style={styles.container}>
      <DrawerButton navigation={navigation} userPhoto={user!.photo!} />
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
                  source={{
                    uri: user!?.photo!,
                  }}
                  style={styles.markerImage}
                />
              </View>
            </View>
          </Marker>
        )}

        {allUsers.map((otherUser) => {
          const { location, photo, uid } = otherUser;
          console.log(
            otherUser,
            'otherUserotherUserotherUserotherUserotherUser'
          );
          if (location && location.latitude && location.longitude) {
            return (
              <Marker
                key={uid}
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                onPress={() => {
                  setSeletedFriendUser(otherUser);
                  setModalVisible(true);
                }}
              >
                <View style={[styles.markerContainer, styles.otherUserMarker]}>
                  <View style={styles.markerPin}>
                    <Image
                      source={{
                        uri: photo,
                      }}
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

      {/* User Info Modal */}
      <UserInfoModal
        visible={modalVisible}
        currentUser={user}
        friendSeletedUser={friendSeletedUser}
        onClose={resetModal}
        onSendRequest={() => console.log('Send request pressed')}
        onMoreInfo={() => console.log('More info pressed')}
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
