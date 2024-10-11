import React, { useState } from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { IUser } from '../../../src/context/AuthContext';
import { addFriendRequest } from '../../../src/utils/firebase';
import { useUserSubCollection } from '../../../src/hooks/useUserSubCollection';

interface UserInfoModalProps {
  visible: boolean;
  currentUser: IUser;
  friendSeletedUser: IUser;
  onClose: () => void;
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({
  visible,
  currentUser,
  friendSeletedUser,
  onClose,
}) => {
  const { data: connections, error } = useUserSubCollection('connections');
  const [loading, setLoading] = useState(false);

  // Check if the selected user is already a friend
  const isFriendRequestState = connections
    .map(({ uid }) => uid)
    .includes(friendSeletedUser?.uid);

  const handleAddFriend = async () => {
    try {
      setLoading(true);
      await addFriendRequest(currentUser, friendSeletedUser);
      onClose();
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
    >
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={styles.modalContent}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Icon name="close" size={24} color="black" />
          </TouchableOpacity>

          {friendSeletedUser && (
            <>
              {friendSeletedUser.photo ? (
                <Image
                  source={{ uri: friendSeletedUser.photo }}
                  style={styles.modalImage}
                />
              ) : null}
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
      </TouchableOpacity>
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
