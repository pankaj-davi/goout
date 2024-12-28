import { Platform } from 'react-native';

export const typography = {
  // Font families
  fontFamily: {
    regular: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
    }),
    medium: Platform.select({
      ios: 'SF Pro Text-Medium',
      android: 'Roboto-Medium',
    }),
    semiBold: Platform.select({
      ios: 'SF Pro Text-Semibold',
      android: 'Roboto-SemiBold',
    }),
    bold: Platform.select({
      ios: 'SF Pro Text-Bold',
      android: 'Roboto-Bold',
    }),
  },

  // Font sizes with consistent scale
  fontSize: {
    xs: 12, // Caption
    sm: 14, // Body Small
    base: 16, // Body
    lg: 18, // Subheading
    xl: 20, // Heading
    '2xl': 24, // Title
    '3xl': 30, // Large Title
    '4xl': 36, // Display
  },

  // Line heights (multiplier of fontSize)
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
  },

  // Text styles presets
  textPresets: {
    heading1: {
      fontSize: 30,
      lineHeight: 1.2,
      fontFamily: Platform.select({
        ios: 'SF Pro Text-Bold',
        android: 'Roboto-Bold',
      }),
      letterSpacing: -0.5,
    },
    heading2: {
      fontSize: 24,
      lineHeight: 1.2,
      fontFamily: Platform.select({
        ios: 'SF Pro Text-Bold',
        android: 'Roboto-Bold',
      }),
      letterSpacing: -0.25,
    },
    body: {
      fontSize: 16,
      lineHeight: 1.5,
      fontFamily: Platform.select({
        ios: 'SF Pro Text',
        android: 'Roboto',
      }),
      letterSpacing: 0,
    },
    caption: {
      fontSize: 12,
      lineHeight: 1.5,
      fontFamily: Platform.select({
        ios: 'SF Pro Text',
        android: 'Roboto',
      }),
      letterSpacing: 0.25,
    },
  },
};