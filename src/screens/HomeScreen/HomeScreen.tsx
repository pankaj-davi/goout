import React from 'react';
import {View, Button} from 'react-native';
import {useAuth} from '../../context/AuthContext';

const HomeScreen: React.FC = () => {
  const {logout} = useAuth();
  return (
    <View>
      <Button title="logOut Screen" onPress={async () => await logout()} />
    </View>
  );
};

export default HomeScreen;
