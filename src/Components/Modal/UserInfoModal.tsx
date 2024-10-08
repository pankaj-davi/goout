import React, { useState } from 'react';
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
import { sendCustomPushNotification } from '../../utils/pushNotificationService'; // Import notification utility
import { IUser } from '../../../src/context/AuthContext';
import { useFriendsListContext } from '../../../src/context/FriendsListContext';

interface UserInfoModalProps {
  visible: boolean;
  currentUser: IUser;
  friendSeletedUser: IUser | null;
  onClose: () => void;
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({
  visible,
  currentUser,
  friendSeletedUser,
  onClose,
}) => {
  const { friends } = useFriendsListContext();
  const [loading, setLoading] = useState(false);

  // Check if the selected user is already a friend
  const isFriendRequestState = friends
    .map(({ uid }) => uid)
    .includes(friendSeletedUser?.uid);

  // Add a friend to the current user’s friends list
  const addFriend = async (currentUserId: string, friendId: string) => {
    try {
      const userRef = firestore().collection('users').doc(currentUserId);
      const friendRef = firestore().collection('users').doc(friendId);

      // Add friend's ID to the friends subcollection
      await userRef
        .collection('friends')
        .doc(friendId)
        .set({
          ...friendSeletedUser,
          requestState: 'Pending',
          addedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Retrieve the friend's device token
      const friendDoc = await friendRef.get();
      if (friendDoc.exists) {
        const friendData = friendDoc.data();
        const friendDeviceToken = friendData?.deviceToken;

        // Trigger notification to the friend
        if (friendDeviceToken) {
          const title = `${currentUser.name} sent you a friend request!`;
          const body = `You have received a friend request from ${friendSeletedUser?.name}.`;
          try {
            await sendCustomPushNotification(
              friendDeviceToken,
              title,
              body,
              currentUser.photo || ''
            );
          } catch (notificationError) {
            console.error(
              'Failed to send push notification: ',
              notificationError
            );
          }
        }
      }
      onClose();
    } catch (error) {
      console.error('Error adding friend: ', error);
    }
  };

  const handleAddFriend = async () => {
    setLoading(true);
    await addFriend(currentUser.uid, friendSeletedUser.uid);
    setLoading(false);
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
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
                  onPress={handleAddFriend}
                  disabled={isFriendRequestState || loading}
                  style={[
                    styles.primaryButton,
                    (isFriendRequestState || loading) && styles.disabledButton,
                  ]}
                  accessible={true}
                  accessibilityLabel="Send friend request"
                >
                  <Text style={styles.buttonText}>
                    {loading
                      ? 'Sending...'
                      : isFriendRequestState
                        ? 'Pending'
                        : 'Send Request'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  // onPress={onMoreInfo} // Uncomment when implementing More Info functionality
                  style={styles.secondaryButton}
                  accessible={true}
                  accessibilityLabel="More information about the user"
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: '#007BFF',
    borderRadius: 5,
    marginRight: 5,
  },
  secondaryButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#6c757d',
    borderRadius: 5,
    marginLeft: 5,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0', // Light grey for disabled state
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
});

export default UserInfoModal;
