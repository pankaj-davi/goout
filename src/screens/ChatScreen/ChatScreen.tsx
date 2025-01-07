import React, { useState, useEffect, useRef, memo } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import ChatMessage from '../../components/ChatMessage/ChatMessage';
import { sendCustomPushNotification } from '../../utils/pushNotificationService';
import { theme } from '../../theme/index';

// Memoize the ChatMessage component
const MemoizedChatMessage = memo(ChatMessage);

const ChatScreen: React.FC = ({ route, navigation }: any) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatId = route.params.chatId;
  const friendDeviceToken = route.params.friendDeviceToken;
  const friendName = route.params.friendName;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp')
      .onSnapshot((snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messages);
        flatListRef.current?.scrollToEnd({ animated: true });
      });
    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;
    if (user) {
      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add({
          message: newMessage,
          sender: user.uid,
          senderName: user.name,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });

      // Send notification to the recipient in the background
      sendCustomPushNotification(
        friendDeviceToken,
        friendName,
        newMessage,
        chatId,
        user.photo
      );

      setNewMessage('');
    }
  };

  const keyExtractor = (item: any) => item.id;

  const getItemLayout = (data: any, index: number) => ({
    length: 70, // Approximate height of each item
    offset: 70 * index,
    index,
  });

  return (
    <View style={styles.container}>
      {user && (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={keyExtractor}
            renderItem={({ item }) => (
              <MemoizedChatMessage
                senderName={item.senderName}
                message={item.message}
                timestamp={
                  item.timestamp ? item.timestamp.toDate().toLocaleString() : ''
                }
                isCurrentUser={item.sender === user.uid}
              />
            )}
            getItemLayout={getItemLayout}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message"
              placeholderTextColor={theme.colors.text}
              multiline={true}
              returnKeyType="default"
            />
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={sendMessage}
            >
              <Icon name="send" size={25} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    width: '100%',
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
  iconContainer: {
    position: 'absolute',
    right: 15,
    top: '55%',
    transform: [{ translateY: -15 }],
  },
});

export default ChatScreen;
