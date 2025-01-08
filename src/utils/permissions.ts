import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';

export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Access Required',
          message: 'This app needs to access your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
        return true; // Return true if permission is granted
      } else {
        console.log('Location permission denied');
        return false; // Return false if permission is denied
      }
    } catch (err) {
      console.warn(err);
      return false; // Return false in case of an error
    }
  }
  return true; // Assume permission is granted on iOS or other platforms
};

export const requestMediaPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ];

      if (Platform.Version >= 33) {
        console.log('Requesting media permissions for Android 13+');
        const granted = await PermissionsAndroid.requestMultiple(permissions);

        const allGranted = Object.values(granted).every(
          (result) => result === PermissionsAndroid.RESULTS.GRANTED
        );

        if (allGranted) {
          console.log('Media permissions granted for Android 13+');
          return true;
        } else {
          console.log('Media permissions denied for Android 13+');
          Alert.alert(
            'Permissions Required',
            'This app needs media permissions to function properly. Please grant the permissions in the app settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
          return false;
        }
      } else {
        // Handle older Android versions
        const grantedCamera = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Access Required',
            message: 'This app needs to access your camera.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        const grantedReadStorage = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Read Storage Access Required',
            message: 'This app needs to access your storage.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        const grantedWriteStorage = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Write Storage Access Required',
            message: 'This app needs to write to your storage.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (
          grantedCamera === PermissionsAndroid.RESULTS.GRANTED &&
          grantedReadStorage === PermissionsAndroid.RESULTS.GRANTED &&
          grantedWriteStorage === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Media permissions granted for older Android versions');
          return true;
        } else {
          console.log('Media permissions denied for older Android versions');
          Alert.alert(
            'Permissions Required',
            'This app needs media permissions to function properly. Please grant the permissions in the app settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
          return false;
        }
      }
    } else {
      // Handle iOS permissions if needed
      return true;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};
