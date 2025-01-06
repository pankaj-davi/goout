import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet from 'react-native-simple-bottom-sheet';
import { IUser } from '../../../src/context/AuthContext';
import { addFriendRequest } from '../../../src/utils/firebase';
import { useUserSubCollection } from '../../../src/hooks/useUserSubCollection';
import { colors } from '../../../src/theme/colors'; // Import colors

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
    <TouchableOpacity
      style={[styles.overlay, visible ? styles.visible : styles.hidden]}
      activeOpacity={1}
      onPress={onClose}
    >
      <BottomSheet isOpen={visible} onClose={onClose}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          {friendSeletedUser && (
            <>
              <View style={styles.row}>
                {friendSeletedUser.photo ? (
                  <Image
                    source={{ uri: friendSeletedUser.photo }}
                    style={styles.modalImage}
                  />
                ) : null}
                <Text style={styles.modalText}>{friendSeletedUser.name}</Text>
              </View>
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
              </View>
            </>
          )}
        </View>
      </BottomSheet>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visible: {
    display: 'flex',
  },
  hidden: {
    display: 'none',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  modalImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  modalText: {
    fontSize: 16,
    color: colors.text,
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
    backgroundColor: colors.primary,
    borderRadius: 5,
    marginRight: 5,
  },
  disabledButton: {
    backgroundColor: colors.buttonDisabled,
  },
  buttonText: {
    color: colors.textLight,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
});

export default UserInfoModal;
