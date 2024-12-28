export interface Theme {
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    neutral50: string;
    neutral100: string;
    neutral200: string;
    neutral300: string;
    neutral400: string;
    neutral500: string;
    neutral600: string;
    neutral700: string;
    neutral800: string;
    neutral900: string;
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    textLight: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    hover: string;
    pressed: string;
    focus: string;
    messageBubble: string;
    messageBubbleSent: string;
  };
  typography: {
    fontFamily: {
      regular: string;
      medium: string;
      semiBold: string;
      bold: string;
    };
    fontSize: {
      xs: number;
      sm: number;
      base: number;
      lg: number;
      xl: number;
      '2xl': number;
      '3xl': number;
      '4xl': number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
    fontWeight: {
      regular: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    letterSpacing: {
      tighter: number;
      tight: number;
      normal: number;
      wide: number;
      wider: number;
    };
    textPresets: {
      heading1: {
        fontSize: number;
        lineHeight: number;
        fontFamily: string;
        letterSpacing: number;
      };
      heading2: {
        fontSize: number;
        lineHeight: number;
        fontFamily: string;
        letterSpacing: number;
      };
      body: {
        fontSize: number;
        lineHeight: number;
        fontFamily: string;
        letterSpacing: number;
      };
      caption: {
        fontSize: number;
        lineHeight: number;
        fontFamily: string;
        letterSpacing: number;
      };
    };
  };
}