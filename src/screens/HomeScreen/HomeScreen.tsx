import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Image, Button } from 'react-native';
import { colors } from '../../theme/colors';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { IUser, useAuth } from '../../context/AuthContext';
import UserInfoModal from '../../components/Modal/UserInfoModal'; // Adjust the path as necessary
import DrawerButton from '../../components/DrawerButton/DrawerButton';
import {
  fetchAllUsersWithLocation,
  getCurrentPosition,
  saveUserLocation,
} from '../../utils/firebase';

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
  refreshContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
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

  const fetchData = async () => {
    try {
      const users = await fetchAllUsersWithLocation(); // Fetch users on mount
      setAllUsers(users);
      const position: any = await getCurrentPosition(); // Get the initial position
      setCurrentLocation(position);
      if (user) {
        await saveUserLocation(user, position.latitude, position.longitude); // Save user location in DB
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to fetch data. Please try again. ${JSON.stringify(error)}`
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
