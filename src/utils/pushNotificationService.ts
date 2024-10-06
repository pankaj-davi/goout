// src/utils/pushNotificationService.ts
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';

// Function to create a notification channel (Android only)
export const createNotificationChannel = () => {
  PushNotification.createChannel(
    {
      channelId: 'your-channel-id-01', // (required)
      channelName: 'My Channel', // (required)
      channelDescription: 'A channel for my notifications', // (optional)
      soundName: 'gooutsound',
      playSound: true,
      importance: 4, // (optional) High importance
      vibrate: true, // (optional) Default: true.
    },
    (created) => console.log(`createChannel returned '${created}'`)
  );
};

// Function to set up foreground notification handler
export const setupForegroundNotificationHandler = () => {
  return messaging().onMessage(async (remoteMessage) => {
    console.log('A new FCM message arrived!', remoteMessage);

    // Get the image URL from the data payload and ensure it's a string
    const imageUrl =
      typeof remoteMessage.data?.imageUrl === 'string'
        ? remoteMessage.data.imageUrl
        : '';

    // Ensure that title and message are strings
    const title = remoteMessage.notification?.title || '';
    const message = remoteMessage.notification?.body || '';

    PushNotification.localNotification({
      channelId: 'your-channel-id-01', // Ensure this matches the channel you created
      title: title, // Ensure title is a string
      message: message, // Ensure message is a string
      playSound: true,
      soundName: 'gooutsound',
      bigPictureUrl: imageUrl, // Include the image URL if available
    });
  });
};

// Function to set up background notification handler
export const setupBackgroundNotificationHandler = () => {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Message handled in the background!', remoteMessage);

    // Get the image URL from the data payload and ensure it's a string
    const imageUrl =
      typeof remoteMessage.data?.imageUrl === 'string'
        ? remoteMessage.data.imageUrl
        : '';

    // Ensure that title and message are strings
    const title = remoteMessage.notification?.title || '';
    const message = remoteMessage.notification?.body || '';

    PushNotification.localNotification({
      channelId: 'your-channel-id-01',
      title: title, // Ensure title is a string
      message: message, // Ensure message is a string
      playSound: true,
      soundName: 'gooutsound',
      bigPictureUrl: imageUrl, // Include the image URL if available
    });
  });
};

export const sendCustomPushNotification = async (
  deviceToken: string,
  title: string,
  body: string,
  imageUrl?: string // Optional image URL
) => {
  try {
    // Payload for the Node.js API
    const payload = {
      deviceToken,
      title,
      body,
      imageUrl,
    };

    // Send a POST request to your Node.js API
    const response = await fetch('http://192.168.1.3:3000/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseText = await response.text(); // Fetch error details
      throw new Error(`Failed to send push notification: ${responseText}`);
    }

    const result = await response.json();
    console.log('Push notification sent successfully!', result);
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
};
