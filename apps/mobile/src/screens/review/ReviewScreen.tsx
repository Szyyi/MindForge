import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../theme';

export default function ReviewScreen() {
  return (
    <LinearGradient
      colors={[colors.colors.background.primary, colors.colors.background.secondary]}
      style={styles.container}
    >
      <Text style={styles.text}>Review Screen</Text>
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
    color: colors.colors.text.primary,
    fontSize: 24,
  },
});