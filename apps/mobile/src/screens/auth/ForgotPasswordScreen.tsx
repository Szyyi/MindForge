// ============================================
// src/screens/auth/ForgotPasswordScreen.tsx
// ============================================
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '../../components/common/GlassCard';
import { PremiumButton } from '../../components/common/PremiumButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={colors.gradients.secondary as any}
                style={styles.iconGradient}
              >
                <Ionicons name="lock-open-outline" size={48} color={colors.text.primary} />
              </LinearGradient>
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                {sent 
                  ? "Check your email for reset instructions"
                  : "Enter your email to receive reset instructions"}
              </Text>
            </View>

            {/* Form */}
            {!sent ? (
              <GlassCard style={styles.formCard}>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={colors.text.muted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <PremiumButton
                  title="Send Reset Link"
                  onPress={handleReset}
                  loading={loading}
                  size="large"
                  style={styles.resetButton}
                />
              </GlassCard>
            ) : (
              <GlassCard style={styles.successCard}>
                <Ionicons name="checkmark-circle" size={64} color={colors.status.success} style={styles.successIcon} />
                <Text style={styles.successText}>Email Sent!</Text>
                <Text style={styles.successSubtext}>
                  We've sent password reset instructions to {email}
                </Text>
                <PremiumButton
                  title="Back to Login"
                  onPress={() => navigation.navigate('Login')}
                  size="large"
                  style={styles.resetButton}
                />
              </GlassCard>
            )}

            {/* Back to Login */}
            <TouchableOpacity 
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>Remember your password? Sign In</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backButton: {
    marginTop: spacing.md,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  formCard: {
    padding: spacing.lg,
  },
  successCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.light,
    borderRadius: spacing.borderRadius.medium,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    height: 52,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
  },
  resetButton: {
    marginTop: spacing.lg,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  successText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  successSubtext: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
  },
});