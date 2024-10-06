/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// Register background message handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in the background!', remoteMessage);
  // Handle the notification or data message in the background.
  // You can show local notifications here if needed.
});

AppRegistry.registerComponent(appName, () => App);
