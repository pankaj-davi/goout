import React, { useState, useEffect } from 'react';
import {
  FlatList,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import ChatMessage from './../../components/ChatMessage/ChatMessage';
import { useAuth } from '../../../src/context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../theme/index';

const ChatScreen: React.FC = ({ route }: any) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatId = route.params.chatId;

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
      setNewMessage('');
    }
  };

  return (
    <View style={styles.container}>
      {user && (
        <>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatMessage
                senderName={item.senderName}
                message={item.message}
                timestamp={
                  item.timestamp ? item.timestamp.toDate().toLocaleString() : ''
                }
                isCurrentUser={item.sender === user.uid}
              />
            )}
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
    minHeight: 50, // Minimum height
    maxHeight: 150, // Optional: Limit the height
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: theme.colors.text,
    backgroundColor: '#fff',
    textAlignVertical: 'top', // Align text to the top
  },
  iconContainer: {
    position: 'absolute',
    right: 15, // Place icon inside the input on the right
    top: '55%', // Vertically center the icon
    transform: [{ translateY: -15 }],
  },
});

export default ChatScreen;
