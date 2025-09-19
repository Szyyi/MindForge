// ============================================
// src/screens/library/LibraryScreen.tsx
// ============================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {colors} from '../../theme/colors';
import {typography} from '../../theme/typography';

export default function LibraryScreen() {
  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.container}
    >
      <Text style={styles.text}>Library Screen</Text>
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