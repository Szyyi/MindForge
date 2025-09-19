// ============================================
// src/screens/auth/SignupScreen.tsx
// ============================================
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle rotation for background elements
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 60000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    if (password.length > 0) {
      if (password.length >= 8) strength++;
      if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
      if (password.match(/[0-9]/)) strength++;
      if (password.match(/[^a-zA-Z0-9]/)) strength++;
    }
    setPasswordStrength(strength);
  }, [password]);

  const handleSignup = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      navigation.navigate('Login');
      setLoading(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 1500);
  };

  const handleInputFocus = (inputName: string) => {
    setFocusedInput(inputName);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 1: return '#EF4444';
      case 2: return '#F59E0B';
      case 3: return '#3B82F6';
      case 4: return '#10B981';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 1: return 'WEAK';
      case 2: return 'FAIR';
      case 3: return 'GOOD';
      case 4: return 'STRONG';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={['#000000', '#0A0A0F', '#000000']}
          style={StyleSheet.absoluteFillObject}
          locations={[0, 0.6, 1]}
        />
        
        {/* Subtle animated orbs */}
        <Animated.View 
          style={[
            styles.backgroundOrb,
            styles.orb1,
            {
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

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
            <Animated.View 
              style={[
                styles.backButton,
                {
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <TouchableOpacity 
                onPress={() => {
                  navigation.goBack();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.backButtonInner}
              >
                <Ionicons name="arrow-back" size={24} color="#00D4FF" />
              </TouchableOpacity>
            </Animated.View>

            {/* Header */}
            <Animated.View 
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim },
                  ],
                },
              ]}
            >
              <Text style={styles.title}>CREATE ACCOUNT</Text>
              <Text style={styles.subtitle}>Begin your journey to mastery</Text>
              
              {/* Progress Steps */}
              <View style={styles.progressSteps}>
                <View style={styles.stepActive} />
                <View style={styles.stepInactive} />
                <View style={styles.stepInactive} />
              </View>
            </Animated.View>

            {/* Signup Form */}
            <Animated.View 
              style={[
                styles.formCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Name Input */}
              <View style={[
                styles.inputContainer,
                focusedInput === 'name' && styles.inputContainerFocused
              ]}>
                <Ionicons name="person-outline" size={20} color="#00D4FF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => handleInputFocus('name')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Email Input */}
              <View style={[
                styles.inputContainer,
                focusedInput === 'email' && styles.inputContainerFocused
              ]}>
                <Ionicons name="mail-outline" size={20} color="#00D4FF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => handleInputFocus('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Password Input with Strength Indicator */}
              <View>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'password' && styles.inputContainerFocused
                ]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#00D4FF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => handleInputFocus('password')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <TouchableOpacity 
                    onPress={() => {
                      setShowPassword(!showPassword);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#00D4FF" 
                    />
                  </TouchableOpacity>
                </View>
                
                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <View style={styles.passwordStrength}>
                    <View style={styles.strengthBars}>
                      {[1, 2, 3, 4].map((level) => (
                        <View
                          key={level}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor: level <= passwordStrength 
                                ? getPasswordStrengthColor() 
                                : 'rgba(255, 255, 255, 0.1)',
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
                      {getPasswordStrengthText()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={[
                styles.inputContainer,
                focusedInput === 'confirmPassword' && styles.inputContainerFocused
              ]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#00D4FF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => handleInputFocus('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Terms Checkbox */}
              <TouchableOpacity 
                style={styles.termsContainer}
                onPress={() => {
                  setAgreedToTerms(!agreedToTerms);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}>
                  {agreedToTerms && <Ionicons name="checkmark" size={16} color="#000000" />}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {/* Signup Button */}
              <TouchableOpacity 
                style={[styles.signupButton, !agreedToTerms && styles.buttonDisabled]}
                onPress={handleSignup}
                disabled={loading || !agreedToTerms}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={agreedToTerms 
                    ? ['#00D4FF', '#0066FF', '#003D99'] as [string, string, ...string[]]
                    : ['#1A1A1A', '#2A2A2A', '#1A1A1A'] as [string, string, ...string[]]}
                  style={styles.signupButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <Animated.View 
                      style={{
                        transform: [{
                          rotate: rotateAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        }],
                      }}
                    >
                      <Ionicons name="sync" size={24} color="#FFFFFF" />
                    </Animated.View>
                  ) : (
                    <Text style={styles.signupButtonText}>CREATE ACCOUNT</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Signup */}
              <View style={styles.socialButtons}>
                <TouchableOpacity 
                  style={styles.socialButton}
                  activeOpacity={0.8}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <Ionicons name="logo-google" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.socialButton}
                  activeOpacity={0.8}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.socialButton}
                  activeOpacity={0.8}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <Ionicons name="logo-github" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Login Link */}
            <Animated.View 
              style={[
                styles.loginLink,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <Text style={styles.loginText}>ALREADY HAVE AN ACCOUNT? </Text>
              <TouchableOpacity 
                onPress={() => {
                  navigation.navigate('Login');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={styles.loginButton}>SIGN IN</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  backgroundOrb: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
  },
  orb1: {
    top: -400,
    right: -200,
    backgroundColor: '#0066FF',
    opacity: 0.05,
  },
  backButton: {
    marginTop: spacing.md,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.medium,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: 'rgba(0, 212, 255, 0.7)',
    letterSpacing: 1,
    marginBottom: spacing.lg,
  },
  progressSteps: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  stepActive: {
    width: 40,
    height: 3,
    backgroundColor: '#0066FF',
    borderRadius: 2,
  },
  stepInactive: {
    width: 40,
    height: 3,
    backgroundColor: 'rgba(0, 102, 255, 0.2)',
    borderRadius: 2,
  },
  formCard: {
    backgroundColor: 'rgba(0, 102, 255, 0.03)',
    borderRadius: spacing.borderRadius.large,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.1)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: spacing.borderRadius.medium,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.2)',
  },
  inputContainerFocused: {
    borderColor: '#0066FF',
    backgroundColor: 'rgba(0, 102, 255, 0.05)',
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
  },
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: spacing.xs,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  strengthText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: spacing.sm,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.3)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  termsText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  termsLink: {
    color: '#00D4FF',
    fontWeight: '600',
  },
  signupButton: {
    marginTop: spacing.sm,
    borderRadius: spacing.borderRadius.medium,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  signupButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontWeight: '900',
    letterSpacing: 2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 102, 255, 0.2)',
  },
  dividerText: {
    color: 'rgba(0, 212, 255, 0.5)',
    fontSize: typography.fontSize.xs,
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: spacing.borderRadius.medium,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.2)',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: typography.fontSize.sm,
    letterSpacing: 1,
  },
  loginButton: {
    color: '#00D4FF',
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    letterSpacing: 1,
  },
});