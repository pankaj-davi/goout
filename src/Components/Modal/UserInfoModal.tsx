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

interface UserInfoModalProps {
  visible: boolean;
  user: {
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
  user,
  onClose,
  onSendRequest,
  onMoreInfo,
}) => {
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

          {user && (
            <>
              <Image source={{ uri: user.photo }} style={styles.modalImage} />
              <Text style={styles.modalText}>Name: {user.name}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={onSendRequest}
                  style={styles.primaryButton}
                >
                  <Text style={styles.buttonText}>Send Request</Text>
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
