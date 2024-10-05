// src/utils/pushNotificationService.ts
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';

/**
 * Function to send a custom notification with an optional image
 * @param deviceToken The device token of the recipient
 * @param title The title of the notification
 * @param body The body message of the notification
 * @param imageUrl The image to display in the notification (optional)
 */
export const sendCustomPushNotification = async (
  deviceToken: string,
  title: string,
  body: string,
  imageUrl?: string // Optional image URL
) => {
  // console.log('##############################');
  try {
    // Send the notification using push notifications
    PushNotification.localNotification({
      channelId: 'your-channel-id-01', // Make sure the channel exists
      title: title,
      message: body,
      playSound: true,
      soundName: 'default',
      largeIconUrl: imageUrl, // Add image URL here (FCM for remote image)
      bigPictureUrl: imageUrl, // Big image (Android only)
    });

    console.log('Push notification with image sent successfully!');
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
};

// Export other functions you already have, such as createNotificationChannel, setupForegroundNotificationHandler, etc.
export const createNotificationChannel = () => {
  PushNotification.createChannel(
    {
      channelId: 'your-channel-id-01',
      channelName: 'My Channel',
      channelDescription: 'A channel for my notifications',
      importance: 4, // High importance
      vibrate: true,
    },
    (created) => console.log(`createChannel returned '${created}'`)
  );
};

export const setupForegroundNotificationHandler = () => {
  return messaging().onMessage(async (remoteMessage: any) => {
    console.log('A new FCM message arrived!', remoteMessage);
    PushNotification.localNotification({
      channelId: 'your-channel-id-01',
      title: remoteMessage.notification?.title,
      message: remoteMessage.notification?.body,
      playSound: true,
      soundName: 'default',
    });
  });
};

export const setupBackgroundNotificationHandler = () => {
  messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
    console.log('Message handled in the background!', remoteMessage);
    PushNotification.localNotification({
      channelId: 'your-channel-id-01',
      title: remoteMessage.notification?.title,
      message: remoteMessage.notification?.body,
      playSound: true,
      soundName: 'default',
    });
  });
};
