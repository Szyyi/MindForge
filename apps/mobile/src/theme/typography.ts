
// ============================================
// src/theme/typography.ts
// ============================================
import { Platform } from 'react-native';

export const typography = {
  // Font families - Montserrat for premium feel
  fontFamily: {
    thin: Platform.select({
      ios: 'Montserrat-Thin',
      android: 'Montserrat-Thin',
      default: 'System',
    }),
    light: Platform.select({
      ios: 'Montserrat-Light',
      android: 'Montserrat-Light',
      default: 'System',
    }),
    regular: Platform.select({
      ios: 'Montserrat-Regular',
      android: 'Montserrat-Regular',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'Montserrat-Medium',
      android: 'Montserrat-Medium',
      default: 'System',
    }),
    semiBold: Platform.select({
      ios: 'Montserrat-SemiBold',
      android: 'Montserrat-SemiBold',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'Montserrat-Bold',
      android: 'Montserrat-Bold',
      default: 'System',
    }),
    black: Platform.select({
      ios: 'Montserrat-Black',
      android: 'Montserrat-Black',
      default: 'System',
    }),
  },
  
  // Font sizes with luxury scaling
  fontSize: {
    micro: 10,
    tiny: 11,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
    giant: 48,
    massive: 64,
  },
  
  // Line heights for readability
  lineHeight: {
    tight: 1.1,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.7,
    loose: 2,
  },
  
  // Letter spacing for elegance
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
    luxury: 3,
  },
  
  // Font weights
  fontWeight: {
    thin: '100' as '100',
    light: '300' as '300',
    regular: '400' as '400',
    medium: '500' as '500',
    semiBold: '600' as '600',
    bold: '700' as '700',
    black: '900' as '900',
  },
};