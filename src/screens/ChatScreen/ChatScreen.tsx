import 'react-native-get-random-values';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
// import storage from '@react-native-firebase/storage';
import DocumentPicker from 'react-native-document-picker';
import {
  GiftedChat,
  IMessage,
  Bubble,
  InputToolbar,
  InputToolbarProps,
} from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/Ionicons';
import { sendCustomPushNotification } from '../../utils/pushNotificationService';
import { theme } from '../../theme';
import { requestMediaPermissions } from '../../utils/permissions';

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

// Extend the IMessage type to include the file property
interface CustomMessage extends IMessage {
  file?: {
    url: string;
    name: string;
    type: string;
  };
}

// Function to convert URI to Blob
export const uriToBlob = (uri: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new Error('uriToBlob failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
};

// Function to upload file to Firebase Storage
// export async function uploadFile(
//   uri: string,
//   filename: string,
//   folder: string
// ): Promise<string | null> {
//   if (!filename) return null;
//   const storageRef = storage().ref(`${folder}/${filename}`);
//   const blobFile = await uriToBlob(uri);
//   try {
//     await storageRef.put(blobFile);
//     const url = await storageRef.getDownloadURL();
//     return url;
//   } catch (err) {
//     console.log(err);
//     return null;
//   }
// }

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CustomMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const { chatId, friendDeviceToken, friendName } = route.params;
  console.log('ChatScreen:', friendDeviceToken);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        const messages = snapshot.docs.map((doc) => {
          const firebaseData = doc.data();

          const data: CustomMessage = {
            _id: doc.id,
            text: firebaseData.message,
            createdAt: firebaseData.timestamp
              ? firebaseData.timestamp.toDate()
              : new Date(),
            user: {
              _id: firebaseData.sender,
              name: firebaseData.senderName,
              avatar: user?.photo || '',
            },
            image: firebaseData.image || undefined,
            file: firebaseData.file || undefined,
          };

          return data;
        });
        setMessages(messages);
      });
    return () => unsubscribe();
  }, [chatId, user?.photo]);

  const onSend = useCallback(
    async (messages: CustomMessage[] = []) => {
      const { text, user: messageUser } = messages[0];

      let fileData = null;
      if (selectedFile) {
        try {
          const fileUri = selectedFile.uri;
          const fileName = selectedFile.name;
          const fileType = selectedFile.type;

          console.log('Uploading file:', { fileUri, fileName, fileType });
          const fileUrl = await uploadFile(fileUri, fileName, 'files');
          console.log('File uploaded:', fileUrl);
          if (fileUrl) {
            fileData = {
              url: fileUrl,
              name: fileName,
              type: fileType,
            };
          } else {
            console.error('Error uploading file: fileUrl is null');
          }
        } catch (error) {
          console.error('Error uploading file:', error);
        }
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
            file: fileData,
          });

        // Send notification to the recipient in the background
        await sendCustomPushNotification(
          friendDeviceToken,
          friendName,
          text,
          chatId,
          user?.photo || ''
        );

        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, messages)
        );
        setSelectedFile(null); // Clear the selected file after sending the message
      } catch (error) {
        console.error('Error saving message to Firestore:', error);
      }
    },
    [selectedFile]
  );

  // const handleFilePick = async () => {
  //   try {
  //     const permissionGranted = await requestMediaPermissions();
  //     if (!permissionGranted) {
  //       console.log('Permission not granted');
  //       return;
  //     }

  //     const result = await DocumentPicker.pickSingle({
  //       type: [DocumentPicker.types.allFiles],
  //     });

  //     if (result) {
  //       console.log('File picked:', result);
  //       setSelectedFile(result); // Store the selected file in the state
  //     }
  //   } catch (error) {
  //     if (DocumentPicker.isCancel(error)) {
  //       console.log('User cancelled the picker');
  //     } else {
  //       console.error('Error picking file:', error);
  //     }
  //   }
  // };

  const sendMessage = () => {
    if (newMessage.trim() === '' && !selectedFile) return;
    onSend([
      {
        text: newMessage,
        user: {
          _id: user?.uid || '',
          name: user?.name || '',
          avatar: user?.photo || '',
        },
        createdAt: new Date(),
        _id: Math.random().toString(),
        file: selectedFile
          ? {
              url: '',
              name: selectedFile.name,
              type: selectedFile.type,
            }
          : undefined,
      },
    ]);
    setNewMessage('');
  };

  const renderInputToolbar = () => {
    return (
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.fileButton}
          // onPress={handleFilePick}
        >
          <Icon name="attach" size={30} color={theme.colors.primary} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
          placeholderTextColor={theme.colors.text}
          multiline={true}
          returnKeyType="default"
        />
        {selectedFile && (
          <Image
            source={{ uri: selectedFile.uri }}
            style={styles.filePreview}
          />
        )}
        <TouchableOpacity style={styles.iconContainer} onPress={sendMessage}>
          <Icon name="send" size={25} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  if (!user) {
    return null; // or handle the null case appropriately
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
