import React, {useState} from 'react';
import {StyleSheet, View, Alert, TouchableOpacity, Text} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: 400,
    width: 400,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

const App: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const handleLocationUpdate = (latitude: number, longitude: number) => {
    console.log({latitude, longitude});
    setCurrentLocation({latitude, longitude});
  };

  const getCurrentPosition = () => {
    try {
      Geolocation.getCurrentPosition(
        pos => {
          console.log(pos);
          const {latitude, longitude} = pos.coords;
          handleLocationUpdate(latitude, longitude);
        },
        error => {
          console.error(error);
          Alert.alert('GetCurrentPosition Error', JSON.stringify(error));
        },
        {enableHighAccuracy: true},
      );
    } catch (err) {
      console.error('Error getting location:', err);
      Alert.alert('Unexpected Error', 'Unable to get location at this time.');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        // provider={PROVIDER_GOOGLE} // Remove if not using Google Maps
        style={styles.map}
        region={{
          latitude: currentLocation?.latitude || 37.78825,
          longitude: currentLocation?.longitude || -122.4324,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}>
        {currentLocation && (
          <Marker coordinate={currentLocation} title="Current Location" />
        )}
      </MapView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={getCurrentPosition}>
          <Text style={styles.buttonText}>Get Current Position</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default App;
