import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

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
    backgroundColor: colors.messageBubbleOwn,
  },
  otherUser: {
    alignSelf: 'flex-start',
    backgroundColor: colors.messageBubble,
  },
  sender: {
    fontWeight: 'bold',
    color: colors.primary,
    fontSize: typography.fontSize.base,
  },
  message: {
    marginVertical: 5,
    color: colors.text,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    alignSelf: 'flex-end',
  },
});

export default ChatMessage;
