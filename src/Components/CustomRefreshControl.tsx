import React from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';

interface CustomRefreshControlProps extends RefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
}

const CustomRefreshControl: React.FC<CustomRefreshControlProps> = ({
  refreshing,
  onRefresh,
  ...rest
}) => {
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      {...rest} // This will allow you to pass additional props like colors or tintColor
    />
  );
};

export default CustomRefreshControl;
