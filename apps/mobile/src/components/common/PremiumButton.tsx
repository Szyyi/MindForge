// src/components/common/PremiumButton.tsx
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {colors} from '../../theme/colors';
import {typography} from '../../theme/typography';
import {shadows} from '../../theme/shadows';
import {spacing} from '../../theme/spacing';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
}) => {
  const gradientMap = {
    primary: colors.gradients.primary,
    secondary: colors.gradients.secondary,
    accent: colors.gradients.accent,
  };

  const sizeMap = {
    small: { height: 40, fontSize: typography.fontSize.sm },
    medium: { height: 52, fontSize: typography.fontSize.md },
    large: { height: 64, fontSize: typography.fontSize.lg },
  };

  const handlePress = () => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[styles.container, style]}
    >
      <LinearGradient
        colors={disabled ? ['#444', '#333'] : (gradientMap[variant] as any)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          { height: sizeMap[size].height },
          shadows.medium,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={[styles.text, { fontSize: sizeMap[size].fontSize }]}>
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: spacing.borderRadius.medium,
    overflow: 'hidden',
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  text: {
    color: colors.text.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});