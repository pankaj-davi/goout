import React from 'react';
import styled, { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme } from '../theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>;
};
