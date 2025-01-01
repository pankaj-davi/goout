import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface FriendItemProps {
  photo: string;
  name: string;
  uid: string;
  onAccept?: () => void;
  onReject?: () => void;
  onWithdraw?: () => void;
  onPress: (uid: string, name: string) => void;
}

const FriendItem: React.FC<FriendItemProps> = ({
  photo,
  name,
  uid,
  onAccept,
  onReject,
  onWithdraw,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(uid, name)}
      style={styles.friendItem}
    >
      <Image source={{ uri: photo }} style={styles.icon} />
      <View style={styles.friendDetails}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.buttonContainer}>
          {onAccept && (
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          )}
          {onReject && (
            <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          )}
          {onWithdraw && (
            <TouchableOpacity
              style={styles.withdrawButton}
              onPress={onWithdraw}
            >
              <Text style={styles.withdrawButtonText}>Withdraw</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FriendItem;

const styles = StyleSheet.create({
  friendItem: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 5,
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  friendDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: typography.fontSize.lg,
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  acceptButtonText: {
    color: colors.textLight,
    fontSize: 12,
  },
  rejectButton: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderColor: colors.primary,
    borderWidth: 1,
    marginRight: 10,
  },
  rejectButtonText: {
    color: colors.primary,
    fontSize: 12,
  },
  withdrawButton: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderColor: colors.error,
    borderWidth: 1,
  },
  withdrawButtonText: {
    color: colors.error,
    fontSize: 12,
  },
});
