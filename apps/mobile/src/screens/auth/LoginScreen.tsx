// ============================================
// src/screens/auth/LoginScreen.tsx
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
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '../../components/common/GlassCard';
import { PremiumButton } from '../../components/common/PremiumButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { loginSuccess } from '../../store/slices/authSlice';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // For testing, just log in
      dispatch(loginSuccess({
        token: 'fake-token',
        refreshToken: 'fake-refresh',
        userId: '123',
      }));
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
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <LinearGradient
                colors={colors.gradients.premium as any}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>M</Text>
              </LinearGradient>
              <Text style={styles.appName}>MindForge</Text>
              <Text style={styles.tagline}>Master Your Knowledge</Text>
            </View>

            {/* Login Form */}
            <GlassCard style={styles.formCard}>
              <Text style={styles.formTitle}>Welcome Back</Text>
              
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

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={colors.text.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={colors.text.tertiary} 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>

              <PremiumButton
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                size="large"
                style={styles.loginButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login */}
              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-google" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-apple" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </GlassCard>

            {/* Sign Up Link */}
            <View style={styles.signupLink}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupButton}>Sign Up</Text>
              </TouchableOpacity>
            </View>
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
  logoSection: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.background.primary,
  },
  appName: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  formCard: {
    padding: spacing.lg,
  },
  formTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
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
  forgotPassword: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'right',
    marginBottom: spacing.lg,
  },
  loginButton: {
    marginTop: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.glass.border,
  },
  dividerText: {
    color: colors.text.tertiary,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: spacing.borderRadius.medium,
    backgroundColor: colors.glass.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  signupLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  signupText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
  },
  signupButton: {
    color: colors.gradients.primary[0],
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
});