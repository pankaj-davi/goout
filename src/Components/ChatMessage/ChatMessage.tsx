import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { theme } from '../../theme/index';
import { typography } from '../../theme/typography';

interface ChatMessageProps {
  message: string;
  timestamp: string;
  isCurrentUser: boolean;
  senderName: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  timestamp,
  isCurrentUser,
  senderName,
}) => {
  return (
    <View
      style={[
        [styles.container, theme.shadows.md],
        isCurrentUser ? [styles.currentUser] : styles.otherUser,
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
    marginVertical: 8,
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
    fontSize: typography.fontSize.sm,
  },
  message: {
    color: colors.text,
    fontSize: typography.fontSize.xs,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    alignSelf: 'flex-end',
  },
});

export default ChatMessage;
