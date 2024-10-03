import React from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Importing Ionicons from react-native-vector-icons
import firestore from '@react-native-firebase/firestore';
import notificationUtils from '../notificationUtils/notificationUtils'; // Import notification utility

interface UserInfoModalProps {
  visible: boolean;
  currentUser: {
    uid: string;
  };
  friendSeletedUser: {
    uid: string;
    name: string;
    photo: string;
    location: {
      latitude: number;
      longitude: number;
    };
  } | null;
  onClose: () => void;
  onSendRequest: () => void; // Add prop for sending request
  onMoreInfo: () => void; // Add prop for more info
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({
  visible,
  currentUser,
  friendSeletedUser,
  onClose,
  onSendRequest,
  onMoreInfo,
}) => {
  // Add a friend to the current user’s friends list
  const addFriend = async (currentUserId: string, friendId: string) => {
    try {
      // Reference to the current user's document
      const userRef = firestore().collection('users').doc(currentUserId);
      const friendRef = firestore().collection('users').doc(friendId); // Reference to the friend's document

      // Add friend's ID to the friends subcollection
      await userRef
        .collection('friends')
        .doc(friendId)
        .set({
          ...friendSeletedUser,
          friendId: friendId,
          addedAt: firestore.FieldValue.serverTimestamp(), // Optional: Track when the friend was added
        });

      // Retrieve the friend's device token
      const friendDoc = await friendRef.get();
      if (friendDoc.exists) {
        const friendData = friendDoc.data();
        const friendDeviceToken = friendData?.deviceToken; // Assuming deviceToken is stored in the friend's data

        // Trigger notification to the friend
        if (friendDeviceToken) {
          const title = `${currentUser.uid} sent you a friend request!`;
          const body = `You have received a friend request from ${friendSeletedUser?.name}.`;
          await notificationUtils.showNotification(title, body);
        }
      }

      onClose();
      console.log('Friend added successfully!');
    } catch (error) {
      console.error('Error adding friend: ', error);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade" // Change to 'fade' for smoother transitions
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']} // Handle orientation changes if needed
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Icon name="close" size={24} color="black" />
          </TouchableOpacity>

          {friendSeletedUser && (
            <>
              <Image
                source={{ uri: friendSeletedUser.photo }}
                style={styles.modalImage}
              />
              <Text style={styles.modalText}>
                Name: {friendSeletedUser.name}
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={onSendRequest}
                  style={styles.primaryButton}
                >
                  <Text
                    style={styles.buttonText}
                    onPress={() =>
                      addFriend(currentUser.uid, friendSeletedUser.uid)
                    }
                  >
                    Send Request
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onMoreInfo}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.buttonText}>More Info</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Ensure a smooth background
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  primaryButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#007BFF', // Primary button color
    borderRadius: 5,
    marginRight: 5, // Add margin between buttons
  },
  secondaryButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#6c757d', // Secondary button color
    borderRadius: 5,
    marginLeft: 5, // Add margin between buttons
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
});

export default UserInfoModal;
