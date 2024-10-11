import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface FriendItemProps {
  photo: string;
  name: string;
  onAccept?: () => void;
  onReject?: () => void;
  onWithdraw?: () => void;
}

const FriendItem: React.FC<FriendItemProps> = ({
  photo,
  name,
  onAccept,
  onReject,
  onWithdraw,
}) => {
  return (
    <View style={styles.friendItem}>
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
    </View>
  );
};

export default FriendItem;

const styles = StyleSheet.create({
  friendItem: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 5,
    elevation: 5,
    shadowColor: '#000',
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
    fontSize: 18,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  rejectButton: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderColor: '#007BFF',
    borderWidth: 1,
    marginRight: 10,
  },
  rejectButtonText: {
    color: '#007BFF',
    fontSize: 12,
  },
  withdrawButton: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderColor: '#FF0000',
    borderWidth: 1,
  },
  withdrawButtonText: {
    color: '#FF0000',
    fontSize: 12,
  },
});
