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
  };

  return (
    <View style={styles.container}>
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
        />
        <TouchableOpacity style={styles.iconContainer} onPress={sendMessage}>
          <Icon name="send" size={30} color="#007AFF" />
        </TouchableOpacity>
      </View>
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
    flex: 1,
    color: '#000',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8, // Adjust padding for icon positioning
    marginRight: 10,
    paddingRight: 40, // Space for the icon inside the input
  },
  iconContainer: {
    position: 'absolute',
    right: 20, // Place icon inside the input on the right
    top: '50%', // Vertically center the icon
    transform: [{ translateY: -15 }],
  },
});

export default ChatScreen;
