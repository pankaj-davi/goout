import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, View, TextInput, Button, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import ChatMessage from './../../components/ChatMessage/ChatMessage';
import { useAuth } from '../../../src/context/AuthContext';

const ChatScreen: React.FC = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatId = route.params.chatId;
  console.log(route?.params, 'routerouterouterouterouterouteroute');

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

  const sendMessage = useCallback(async () => {
    if (newMessage.trim() === '') return;
    const test = await firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .add({
        message: newMessage,
        sender: user.uid,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
    setNewMessage('');
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatMessage
            sender={item.sender}
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
        <Button title="Send" onPress={sendMessage} />
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
    color: '#000',
  },
  input: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 5,
    color: '#000',
  },
});

export default ChatScreen;
