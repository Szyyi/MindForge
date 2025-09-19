// ============================================
// src/screens/auth/LoginScreen.tsx
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

// Import the typed hook from your store
import { useAppDispatch } from '../../store';
import { loginAsync } from '../../store/slices/authSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch(); // Using the typed dispatch
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Background rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 30000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      console.log('Please enter email and password');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    
    try {
      // Dispatch the login async thunk - properly typed
      await dispatch(loginAsync({ email, password })).unwrap();
      
      // If successful, the auth state will update and navigation should happen automatically
      // through your navigation container listening to auth state
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Optional: You can navigate manually if needed
      // navigation.navigate('Main');
    } catch (error) {
      // Handle login error
      console.error('Login failed:', error);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = (inputName: string) => {
    setFocusedInput(inputName);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      {/* Clean Background */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={['#000000', '#0A0A0F', '#000000']}
          style={StyleSheet.absoluteFillObject}
          locations={[0, 0.5, 1]}
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
            {/* Logo Section */}
            <Animated.View 
              style={[
                styles.logoSection,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: pulseAnim },
                  ],
                },
              ]}
            >
              {/* Logo Container */}
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#00D4FF', '#0066FF', '#003D99'] as [string, string, ...string[]]}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.logoText}>M</Text>
                </LinearGradient>
                <View style={styles.logoBorder} />
              </View>
              
              <Text style={styles.appName}>MINDFORGE</Text>
              <Text style={styles.tagline}>Master Your Knowledge</Text>
            </Animated.View>

            {/* Login Form with Glass Effect */}
            <Animated.View 
              style={[
                styles.formCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.formTitle}>ACCOUNT LOGIN</Text>
              
              {/* Email Input */}
              <View style={[
                styles.inputContainer,
                focusedInput === 'email' && styles.inputContainerFocused
              ]}>
                <Ionicons name="mail-outline" size={20} color="#00D4FF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => handleInputFocus('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Password Input */}
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
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#00D4FF" 
                  />
                </TouchableOpacity>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity 
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotPasswordButton}
              >
                <Text style={styles.forgotPassword}>FORGOT YOUR PASSWORD?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#00D4FF', '#0066FF', '#003D99'] as [string, string, ...string[]]}
                  style={styles.loginButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
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
                    </View>
                  ) : (
                    <Text style={styles.loginButtonText}>INITIALISE</Text>
                  )}
                </LinearGradient>
                <View style={styles.buttonBorder} />
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <View style={styles.dividerTextContainer}>
                  <Text style={styles.dividerText}>ALTERNATIVE ACCESS</Text>
                </View>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login */}
              <View style={styles.socialButtons}>
                <TouchableOpacity 
                  style={styles.socialButton}
                  activeOpacity={0.8}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <View style={styles.socialButtonInner}>
                    <Ionicons name="logo-google" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.socialButtonBorder} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.socialButton}
                  activeOpacity={0.8}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <View style={styles.socialButtonInner}>
                    <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.socialButtonBorder} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.socialButton}
                  activeOpacity={0.8}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <View style={styles.socialButtonInner}>
                    <Ionicons name="logo-github" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.socialButtonBorder} />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Sign Up Link */}
            <Animated.View 
              style={[
                styles.signupLink,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <Text style={styles.signupText}>NEW USER? </Text>
              <TouchableOpacity 
                onPress={() => {
                  navigation.navigate('Signup');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={styles.signupButton}>CREATE ACCOUNT</Text>
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
    justifyContent: 'center',
  },
  backgroundOrb: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
  },
  orb1: {
    top: -250,
    left: -150,
    backgroundColor: '#0066FF',
    opacity: 0.1,
  },
  orb2: {
    bottom: -250,
    right: -150,
    backgroundColor: '#00D4FF',
    opacity: 0.08,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: 'transparent',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0066FF',
    top: -20,
    left: '50%',
    marginLeft: -60,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(0, 212, 255, 0.7)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  formCard: {
    backgroundColor: 'rgba(0, 102, 255, 0.03)',
    borderRadius: spacing.borderRadius.large,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.1)',
  },
  formTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: '#00D4FF',
    marginBottom: spacing.xl,
    textAlign: 'center',
    letterSpacing: 3,
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
    position: 'relative',
  },
  inputContainerFocused: {
    borderColor: '#0066FF',
    backgroundColor: 'rgba(0, 102, 255, 0.05)',
  },
  inputGlow: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: spacing.borderRadius.medium,
    backgroundColor: '#0066FF',
    opacity: 0.2,
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
  eyeButton: {
    padding: spacing.xs,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPassword: {
    color: 'rgba(0, 212, 255, 0.7)',
    fontSize: typography.fontSize.xs,
    letterSpacing: 1,
  },
  loginButton: {
    marginTop: spacing.sm,
    position: 'relative',
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: spacing.borderRadius.medium,
    backgroundColor: '#0066FF',
    opacity: 0.3,
  },
  loginButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderRadius: spacing.borderRadius.medium,
  },
  buttonBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: spacing.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontWeight: '900',
    letterSpacing: 2,
  },
  loadingContainer: {
    height: 24,
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
  dividerTextContainer: {
    paddingHorizontal: spacing.md,
  },
  dividerText: {
    color: 'rgba(0, 212, 255, 0.5)',
    fontSize: typography.fontSize.xs,
    letterSpacing: 1,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  socialButton: {
    position: 'relative',
    width: 56,
    height: 56,
  },
  socialButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: spacing.borderRadius.medium,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.2)',
  },
  socialButtonBorder: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: spacing.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  signupLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  signupText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: typography.fontSize.sm,
    letterSpacing: 1,
  },
  signupButton: {
    color: '#00D4FF',
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    letterSpacing: 1,
  },
});