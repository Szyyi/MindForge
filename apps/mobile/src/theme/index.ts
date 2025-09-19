// ============================================
// src/theme/index.ts

import { animations } from './animations';
import { colors } from './colors';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';
import { Platform } from 'react-native';

// Theme preset combinations
export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  animations,
};

// Semantic theme tokens
export const tokens = {
  // Component tokens
  button: {
    height: {
      small: 36,
      medium: 44,
      large: 52,
    },
    borderRadius: spacing.borderRadius.medium,
  },
  
  card: {
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.cardPadding.medium,
  },
  
  input: {
    height: 48,
    borderRadius: spacing.borderRadius.medium,
  },
  
  tabBar: {
    height: 80,
    iconSize: 24,
  },
  
  header: {
    height: Platform.select({
      ios: 100,
      android: 80,
      default: 80,
    }),
  },
};

export default theme;