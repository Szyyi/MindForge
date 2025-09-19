// ============================================
// src/screens/stats/StatsScreen.tsx
// ============================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {colors} from '../../theme/colors';
import {typography} from '../../theme/typography';

export default function StatsScreen() {
  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.container}
    >
      <Text style={styles.text}>Stats Screen</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xl,
  },
});

