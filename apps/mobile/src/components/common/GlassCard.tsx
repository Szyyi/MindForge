// src/components/common/GlassCard.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {colors} from '../../theme/colors';
import {shadows} from '../../theme/shadows';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'light' | 'medium' | 'heavy';
  gradient?: readonly [string, string, ...string[]];
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  style,
  variant = 'medium',
  gradient = [colors.glass.medium, colors.glass.light]
}) => {
  return (
    <View style={[styles.container, shadows.large, style]}>
      <BlurView intensity={20} style={styles.blurView} tint="dark">
        <LinearGradient
          colors={gradient}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.glass.light,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  blurView: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  content: {
    padding: 20,
  },
});