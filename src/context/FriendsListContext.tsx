import React, { createContext, useContext } from 'react';
import { useFriendsList, UseFriendsListResult } from '../hooks/useFriendsList'; // Adjust the path accordingly

// Create the context
const FriendsListContext = createContext<UseFriendsListResult | undefined>(
  undefined
);

// Create a provider component
export const FriendsListProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const friendsList = useFriendsList();

  return (
    <FriendsListContext.Provider value={friendsList}>
      {children}
    </FriendsListContext.Provider>
  );
};

// Create a custom hook to use the FriendsListContext
export const useFriendsListContext = () => {
  const context = useContext(FriendsListContext);
  if (context === undefined) {
    throw new Error(
      'useFriendsListContext must be used within a FriendsListProvider'
    );
  }
  return context;
};
