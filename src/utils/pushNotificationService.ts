import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';

/**
 * Function to send a custom push notification using the Node.js API
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
  try {
    // Payload for the Node.js API
    const payload = {
      deviceToken,
      title,
      body,
      imageUrl,
    };

    // Send a POST request to the Node.js API (replace localhost with your server IP if needed)
    const response = await fetch('http://192.168.1.3:3000/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload), // Convert the payload to JSON
    });

    // Check for errors in the response
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

// Other notification handlers...

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
