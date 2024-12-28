import styled from 'styled-components';
import { View } from 'react-native';

export const StyledView = styled(View)`
  background-color: ${({ theme }) => theme.colors.background};
`;