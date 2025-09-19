// ============================================
// src/theme/spacing.ts
// ============================================
export const spacing = {
  // Base spacing units (using 4pt grid)
  micro: 2,
  tiny: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  huge: 96,
  massive: 128,
  
  // Component-specific spacing
  buttonPadding: {
    small: { x: 16, y: 8 },
    medium: { x: 24, y: 12 },
    large: { x: 32, y: 16 },
  },
  
  cardPadding: {
    small: 16,
    medium: 24,
    large: 32,
  },
  
  screenPadding: {
    horizontal: 24,
    vertical: 32,
  },
  
  // Border radius for luxury rounded corners
  borderRadius: {
    micro: 4,
    small: 8,
    medium: 12,
    large: 16,
    xl: 24,
    xxl: 32,
    full: 999,
  },
};