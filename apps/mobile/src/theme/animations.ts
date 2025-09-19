// ============================================
// src/theme/animations.ts
// ============================================
export const animations = {
  // Timing configurations
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 700,
    slowest: 1000,
  },
  
  // Easing functions
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Spring configurations for react-native-reanimated
  spring: {
    gentle: {
      damping: 15,
      stiffness: 150,
    },
    bouncy: {
      damping: 10,
      stiffness: 200,
    },
    stiff: {
      damping: 20,
      stiffness: 300,
    },
  },
};