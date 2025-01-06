import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet from 'react-native-simple-bottom-sheet';
import { IUser } from '../../../src/context/AuthContext';
import { addFriendRequest } from '../../../src/utils/firebase';
import { useUserSubCollection } from '../../../src/hooks/useUserSubCollection';
import { colors } from '../../../src/theme/colors'; // Import colors
import { useNavigation } from '@react-navigation/native';

interface IUserProps extends IUser {
  dob: string;
  bio: string;
  jobTitle: string;
  companyName: string;
}

interface UserInfoModalProps {
  visible: boolean;
  currentUser: IUserProps;
  friendSeletedUser: IUserProps;
  onClose: () => void;
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({
  visible,
  currentUser,
  friendSeletedUser,
  onClose,
}) => {
  const { data: connections, error } = useUserSubCollection('connections');
  const { data: friends, error: friendsError } =
    useUserSubCollection('friends');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

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

  const handleChat = () => {
    const chatId = [currentUser.uid, friendSeletedUser.uid].sort().join('_');
    //@ts-ignore
    navigation.navigate('ChatScreen', {
      chatId,
      friendImage: friendSeletedUser.photo,
      friendName: friendSeletedUser.name,
    });
    onClose();
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const isFriend = friends.some(({ uid }) => uid === friendSeletedUser?.uid);

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
                <View>
                  <Text style={styles.modalName}>{friendSeletedUser.name}</Text>
                  {friendSeletedUser.dob && (
                    <View style={styles.infoRow}>
                      <Icon
                        name="calendar"
                        size={20}
                        color={colors.primaryLight}
                      />
                      <Text style={styles.modalText}>
                        Age: {calculateAge(friendSeletedUser.dob)}
                      </Text>
                    </View>
                  )}
                  {friendSeletedUser.jobTitle && (
                    <View style={styles.infoRow}>
                      <Icon
                        name="briefcase"
                        size={20}
                        color={colors.primaryLight}
                      />
                      <Text style={styles.modalText}>
                        {friendSeletedUser.jobTitle}
                      </Text>
                    </View>
                  )}
                  {friendSeletedUser.companyName && (
                    <View style={styles.infoRow}>
                      <Icon
                        name="business"
                        size={20}
                        color={colors.primaryLight}
                      />
                      <Text style={styles.modalText}>
                        {friendSeletedUser.companyName}
                      </Text>
                    </View>
                  )}
                  {friendSeletedUser.bio && (
                    <View style={styles.infoRow}>
                      <Text style={styles.modalText}>
                        {friendSeletedUser.bio}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.buttonContainer}>
                {isFriend ? (
                  <TouchableOpacity
                    onPress={handleChat}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.buttonText}>Chat</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleAddFriend}
                    disabled={isFriendRequestState || loading}
                    style={[
                      styles.primaryButton,
                      (isFriendRequestState || loading) &&
                        styles.disabledButton,
                    ]}
                    accessible={true}
                    accessibilityLabel="Send friend request"
                  >
                    <Text style={styles.buttonText}>
                      {loading
                        ? 'Sending...'
                        : isFriendRequestState
                          ? 'Pending'
                          : 'Add Friend'}
                    </Text>
                  </TouchableOpacity>
                )}
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
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  modalImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  modalName: {
    fontSize: 20,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: 10, // Add margin bottom
  },
  modalText: {
    fontSize: 16,
    color: colors.textSecondary,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    marginTop: 8,
  },
});

export default UserInfoModal;
