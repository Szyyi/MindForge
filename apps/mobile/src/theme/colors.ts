// ============================================
// src/theme/colors.ts
// ============================================
export const colors = {
  // Deep, luxurious blacks with subtle blue undertones
  background: {
    primary: '#050507',      // Pure deep black
    secondary: '#0A0B0F',    // Rich dark navy-black
    tertiary: '#12141A',     // Elevated surface
    elevated: '#1A1C24',     // Card backgrounds
    overlay: 'rgba(5, 5, 7, 0.95)',  // Modal overlays
  },
  
  // Premium gradient combinations
  gradients: {
    // Main brand gradients
    premium: ['#D4AF37', '#FFD700', '#F4E4C1'],  // Gold luxury
    primary: ['#6366F1', '#818CF8', '#A5B4FC'],   // Indigo elegance
    secondary: ['#8B5CF6', '#A78BFA', '#C4B5FD'], // Purple sophistication
    accent: ['#EC4899', '#F472B6', '#F9A8D4'],    // Pink accent
    
    // Functional gradients
    success: ['#10B981', '#34D399', '#6EE7B7'],
    warning: ['#F59E0B', '#FBBF24', '#FDE68A'],
    error: ['#EF4444', '#F87171', '#FCA5A5'],
    
    // Special effect gradients
    holographic: ['#A78BFA', '#818CF8', '#60A5FA', '#34D399', '#A78BFA'],
    aurora: ['#6366F1', '#8B5CF6', '#EC4899', '#F472B6'],
    metallic: ['#71717A', '#A1A1AA', '#D4D4D8', '#A1A1AA', '#71717A'],
    
    // Card gradients with transparency
    glassCard: [
      'rgba(255, 255, 255, 0.06)',
      'rgba(255, 255, 255, 0.02)',
    ],
    premiumCard: [
      'rgba(212, 175, 55, 0.1)',
      'rgba(212, 175, 55, 0.02)',
    ],
  },
  
  // Glass morphism effects
  glass: {
    ultraLight: 'rgba(255, 255, 255, 0.02)',
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    heavy: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.15)',
    shimmer: 'rgba(255, 255, 255, 0.25)',
    glow: 'rgba(255, 255, 255, 0.3)',
  },
  
  // Premium text colors with hierarchy
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.9)',
    tertiary: 'rgba(255, 255, 255, 0.7)',
    muted: 'rgba(255, 255, 255, 0.5)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    inverse: '#050507',
    gold: '#D4AF37',
  },
  
  // Semantic colors for status
  status: {
    success: '#10B981',
    successLight: '#34D399',
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    error: '#EF4444',
    errorLight: '#F87171',
    info: '#3B82F6',
    infoLight: '#60A5FA',
  },
  
  // Glow effects for interactive elements
  glow: {
    purple: '#8B5CF6',
    blue: '#3B82F6',
    pink: '#EC4899',
    gold: '#D4AF37',
    green: '#10B981',
  },
  
  // Chart and data visualization colors
  chart: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    tertiary: '#EC4899',
    quaternary: '#10B981',
    quinary: '#F59E0B',
  },
};
