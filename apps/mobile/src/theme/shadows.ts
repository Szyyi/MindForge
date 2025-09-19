// ============================================
// src/theme/shadows.ts - FUTURISTIC SHADOWS & GLOWS
// ============================================
import { Platform } from 'react-native';

export const shadows = {
  // Subtle depth shadows
  micro: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  
  small: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  
  medium: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  
  large: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      default: {},
    }),
  },
  
  xl: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
      },
      default: {},
    }),
  },
  
  // Neon blue glow effects
  neonGlow: {
    soft: {
      ...Platform.select({
        ios: {
          shadowColor: '#0066FF',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        },
        android: {
          elevation: 0,
        },
        default: {},
      }),
    },
    medium: {
      ...Platform.select({
        ios: {
          shadowColor: '#0066FF',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
        },
        android: {
          elevation: 0,
        },
        default: {},
      }),
    },
    strong: {
      ...Platform.select({
        ios: {
          shadowColor: '#00D4FF',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.7,
          shadowRadius: 30,
        },
        android: {
          elevation: 0,
        },
        default: {},
      }),
    },
    pulse: {
      ...Platform.select({
        ios: {
          shadowColor: '#00F0FF',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 40,
        },
        android: {
          elevation: 0,
        },
        default: {},
      }),
    },
  },
  
  // Dynamic glow function
  glow: (color: string = '#0066FF', intensity: number = 0.5) => ({
    ...Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: intensity,
        shadowRadius: 20,
      },
      android: {
        elevation: 0,
        // Android doesn't support colored shadows natively
        // Consider using a View with absolute positioning for glow effect
      },
      default: {},
    }),
  }),
  
  // Inner shadow for pressed states
  innerPressed: {
    ...Platform.select({
      ios: {
        shadowColor: '#0066FF',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: -1,
      },
      default: {},
    }),
  },
  
  // Premium card shadow with blue accent
  premium: {
    ...Platform.select({
      ios: {
        shadowColor: '#0066FF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
      },
      android: {
        elevation: 15,
      },
      default: {},
    }),
  },
  
  // Holographic effect
  holographic: {
    ...Platform.select({
      ios: {
        shadowColor: '#00D4FF',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
};