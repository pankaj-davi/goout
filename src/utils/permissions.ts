import { PermissionsAndroid, Platform, Alert } from 'react-native';

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

export const requestMediaPermissions = async () => {
  if (Platform.OS === 'android') {
    const androidVersion = Platform.Version; // Returns the version as a number
    console.log(`Current Android version: ${androidVersion}`);
    try {
      if (androidVersion >= 33) {
        // Handle Android 13+ permissions
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ];

        console.log('Requesting media permissions for Android 1333333333333+');
        const granted = await PermissionsAndroid.requestMultiple(permissions);

        const allGranted = Object.values(granted).every(
          (result) => result === PermissionsAndroid.RESULTS.GRANTED
        );

        if (allGranted) {
          console.log('Media permissions granted for Android 13+');
          return true;
        } else {
          console.log('Media permissions denied for Android 13+');
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

        const grantedStorage = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Access Required',
            message: 'This app needs to access your storage.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (
          grantedCamera === PermissionsAndroid.RESULTS.GRANTED &&
          grantedStorage === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Media permissions granted');
          return true;
        } else {
          console.log('Media permissions denied');
          return false;
        }
      }
    } catch (err) {
      console.error('Error requesting permissions:', err);
      return false;
    }
  }
  return true; // Assume permission is granted on iOS or other platforms
};
