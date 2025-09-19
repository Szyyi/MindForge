// ============================================
// src/theme/colors.ts - FUTURISTIC BLACK & BLUE THEME
// ============================================
export const colors = {
  // Pure blacks with subtle blue undertones for depth
  background: {
    primary: '#000000',      // Pure black
    secondary: '#0A0A0F',    // Near-black with blue hint
    tertiary: '#0F1117',     // Elevated surface
    elevated: '#141922',     // Card backgrounds
    overlay: 'rgba(0, 0, 0, 0.95)',  // Modal overlays
  },
  
  // Premium blue-focused gradients
  gradients: {
    // Main brand gradients - ALL BLUE VARIANTS
    premium: ['#0066FF', '#0052CC', '#003D99'],     // Rich electric blue
    primary: ['#2563EB', '#1D4ED8', '#1E40AF'],     // Royal blue gradient
    secondary: ['#3B82F6', '#2563EB', '#1D4ED8'],   // Sky to royal
    accent: ['#00D4FF', '#0099FF', '#0066FF'],      // Cyan to electric
    
    // Functional gradients with blue tints
    success: ['#06B6D4', '#0891B2', '#0E7490'],     // Cyan success
    warning: ['#0EA5E9', '#0284C7', '#0369A1'],     // Blue warning
    error: ['#7C3AED', '#6D28D9', '#5B21B6'],       // Purple error
    
    // Special effect gradients
    holographic: ['#00D4FF', '#0066FF', '#4F46E5', '#0066FF', '#00D4FF'],
    aurora: ['#0066FF', '#2563EB', '#3B82F6', '#60A5FA'],
    neon: ['#00F0FF', '#0099FF', '#0066FF', '#003D99'],
    matrix: ['#00FF41', '#00D4FF', '#0066FF'],      // Matrix-style blue-green
    
    // Card gradients with blue glass effect
    glassCard: [
      'rgba(0, 102, 255, 0.05)',
      'rgba(0, 102, 255, 0.01)',
    ],
    premiumCard: [
      'rgba(37, 99, 235, 0.08)',
      'rgba(37, 99, 235, 0.02)',
    ],
  },
  
  // Glass morphism with blue tint
  glass: {
    ultraLight: 'rgba(0, 102, 255, 0.02)',
    light: 'rgba(0, 102, 255, 0.05)',
    medium: 'rgba(0, 102, 255, 0.08)',
    heavy: 'rgba(0, 102, 255, 0.12)',
    border: 'rgba(0, 102, 255, 0.2)',
    shimmer: 'rgba(0, 212, 255, 0.3)',
    glow: 'rgba(0, 102, 255, 0.4)',
  },
  
  // Clean white text hierarchy
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.92)',
    tertiary: 'rgba(255, 255, 255, 0.75)',
    muted: 'rgba(255, 255, 255, 0.5)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    inverse: '#000000',
    accent: '#00D4FF',  // Cyan accent for highlights
    link: '#0099FF',    // Link blue
  },
  
  // Status colors with blue theme
  status: {
    success: '#06B6D4',      // Cyan
    successLight: '#22D3EE',
    warning: '#0EA5E9',      // Sky blue
    warningLight: '#38BDF8',
    error: '#7C3AED',        // Violet
    errorLight: '#8B5CF6',
    info: '#0066FF',         // Primary blue
    infoLight: '#3B82F6',
  },
  
  // Neon glow effects for interactive elements
  glow: {
    blue: '#0066FF',
    cyan: '#00D4FF',
    electric: '#00F0FF',
    purple: '#7C3AED',
    white: '#FFFFFF',
  },
  
  // Chart colors - all blue spectrum
  chart: {
    primary: '#0066FF',
    secondary: '#2563EB',
    tertiary: '#3B82F6',
    quaternary: '#60A5FA',
    quinary: '#93C5FD',
  },
  
  // Special effects
  neon: {
    blue: '#0066FF',
    cyan: '#00D4FF',
    electric: '#00F0FF',
    pulse: 'rgba(0, 102, 255, 0.6)',
  },
};