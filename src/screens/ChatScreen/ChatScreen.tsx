import 'react-native-get-random-values';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import DocumentPicker from 'react-native-document-picker';
import { GiftedChat, IMessage, Bubble } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/Ionicons';
import { sendCustomPushNotification } from '../../utils/pushNotificationService';
import { theme } from '../../theme';
import { requestMediaPermissions } from '../../utils/permissions';
import { FIREBASE_STORAGE_BUCKET } from '@env';

interface ChatScreenProps {
  route: {
    params: {
      chatId: string;
      friendDeviceToken: string;
      friendName: string;
    };
  };
  navigation: any;
}

interface CustomMessage extends IMessage {
  file?: {
    url: string;
    name: string;
    type: string;
  };
}

// Define the file type
type SelectedFile = {
  fileCopyUri: string;
  name: string;
  size: number;
  type: string;
  uri: string;
};

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CustomMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const { chatId, friendDeviceToken, friendName } = route.params;

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        const messages = snapshot.docs.map((doc) => {
          const firebaseData = doc.data();
          return {
            _id: doc.id,
            text: firebaseData.message,
            createdAt: firebaseData.timestamp?.toDate() || new Date(),
            user: {
              _id: firebaseData.sender,
              name: firebaseData.senderName,
              avatar: user?.photo || '',
            },
            image: firebaseData.image,
            file: firebaseData.file,
          } as CustomMessage;
        });
        setMessages(messages);
      });
    return () => unsubscribe();
  }, [chatId, user?.photo]);

  const uploadFile = async (file: SelectedFile) => {
    const { fileCopyUri, name, type } = file;
    const filePath = fileCopyUri.replace('file://', '');
    const fileRef = storage().refFromURL(
      `${FIREBASE_STORAGE_BUCKET}/uploads/my-folder/${new Date().getTime()}_${name}`
    );

    console.log('Uploading file:', { fileCopyUri, name, type });
    console.log('File exists, starting upload...');

    const uploadTask = fileRef.putFile(filePath);

    uploadTask.on('state_changed', (taskSnapshot) => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes} bytes`
      );
    });

    try {
      await uploadTask;
      const downloadURL = await fileRef.getDownloadURL();
      console.log('File uploaded successfully. Download URL:', downloadURL);
      return { name, url: downloadURL };
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const onSend = useCallback(
    async (messages: CustomMessage[] = []) => {
      const { text } = messages[0];
      let fileData = null;

      if (selectedFile) {
        fileData = await uploadFile(selectedFile as SelectedFile);
      }

      try {
        await firestore()
          .collection('chats')
          .doc(chatId)
          .collection('messages')
          .add({
            message: text,
            sender: user?.uid,
            senderName: user?.name,
            timestamp: firestore.FieldValue.serverTimestamp(),
            file: fileData || undefined,
          });

        await sendCustomPushNotification(
          friendDeviceToken,
          friendName,
          text,
          chatId,
          user?.photo || ''
        );

        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [
            {
              text,
              user: {
                _id: user?.uid || '',
                name: user?.name || '',
                avatar: user?.photo || '',
              },
              createdAt: new Date(),
              _id: Math.random().toString(),
              file: fileData as any,
              image: fileData?.url,
            },
          ])
        );
        setSelectedFile(null);
      } catch (error) {
        console.error('Error saving message to Firestore:', error);
      }
    },
    [selectedFile, chatId, friendDeviceToken, friendName]
  );

  const handleFilePick = async () => {
    const permissionGranted = await requestMediaPermissions();
    if (!permissionGranted) {
      Alert.alert(
        'Permissions Required',
        'This app needs media permissions to function properly. Please grant the permissions in the app settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });

      if (result) {
        setSelectedFile(result);
      }
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('Error picking file:', error);
      } else {
        console.log('User cancelled the picker');
      }
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === '' && !selectedFile) return;

    let fileData = null;
    if (selectedFile) {
      fileData = await uploadFile(selectedFile as SelectedFile);
    }

    try {
      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add({
          message: newMessage,
          sender: user?.uid,
          senderName: user?.name,
          timestamp: firestore.FieldValue.serverTimestamp(),
          file: fileData,
        });

      await sendCustomPushNotification(
        friendDeviceToken,
        friendName,
        newMessage,
        chatId,
        user?.photo || ''
      );

      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [
          {
            text: newMessage,
            user: {
              _id: user?.uid || '',
              name: user?.name || '',
              avatar: user?.photo || '',
            },
            createdAt: new Date(),
            _id: Math.random().toString(),
            file: fileData,
          },
        ])
      );
      setSelectedFile(null);
      setNewMessage('');
    } catch (error) {
      console.error('Error saving message to Firestore:', error);
    }
  };

  const renderInputToolbar = () => (
    <View style={styles.inputContainer}>
      <TouchableOpacity style={styles.fileButton} onPress={handleFilePick}>
        <Icon name="attach" size={30} color={theme.colors.primary} />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder="Type a message"
        placeholderTextColor={theme.colors.text}
        multiline
        returnKeyType="default"
      />
      {selectedFile && (
        <Image source={{ uri: selectedFile.uri }} style={styles.filePreview} />
      )}
      <TouchableOpacity style={styles.iconContainer} onPress={sendMessage}>
        <Icon name="send" size={25} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: user.uid,
          name: user.name,
          avatar: user.photo,
        }}
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              left: {
                backgroundColor: theme.colors.messageBubble,
              },
              right: {
                backgroundColor: theme.colors.messageBubbleSent,
              },
            }}
            textStyle={{
              left: {
                color: theme.colors.messageText,
              },
              right: {
                color: theme.colors.messageTextOwn,
              },
            }}
          />
        )}
        renderInputToolbar={renderInputToolbar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.background,
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 150,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: theme.colors.text,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  fileButton: {
    marginRight: 10,
  },
  filePreview: {
    width: 50,
    height: 50,
    marginLeft: 10,
  },
  iconContainer: {
    marginLeft: 10,
  },
});

export default ChatScreen;
