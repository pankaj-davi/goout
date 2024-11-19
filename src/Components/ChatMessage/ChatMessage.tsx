import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ChatMessageProps {
  sender: string;
  message: string;
  timestamp: string;
  isCurrentUser: boolean;
  senderName: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  sender,
  message,
  timestamp,
  isCurrentUser,
  senderName,
}) => {
  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.currentUser : styles.otherUser,
      ]}
    >
      <Text style={styles.sender}>{isCurrentUser ? 'You' : senderName}</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    maxWidth: '75%',
  },
  currentUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  otherUser: {
    alignSelf: 'flex-start',
    backgroundColor: '#E1E1E1',
  },
  sender: {
    fontWeight: 'bold',
    color: 'blue',
    fontSize: 16,
  },
  message: {
    marginVertical: 5,
    color: '#000',
  },
  timestamp: {
    fontSize: 10,
    color: 'grey',
    alignSelf: 'flex-end',
  },
});

export default ChatMessage;
