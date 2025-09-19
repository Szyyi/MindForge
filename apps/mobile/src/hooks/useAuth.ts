// src/hooks/useAuth.ts
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  loginAsync,
  signupAsync,
  logoutAsync,
  checkAuthStatusAsync,
  requestPasswordResetAsync,
  resetPasswordAsync,
  verifyEmailAsync,
  resendVerificationEmailAsync,
  oauthLoginAsync,
  deleteAccountAsync,
  clearError,
  updateUser,
} from '../store/slices/authSlice';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { storageService } from '../services/storage/asyncStorage';

interface UseAuthReturn {
  // State
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  error: string | null;
  isEmailVerified: boolean;
  loginAttempts: number;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, username: string, marketingConsent?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<boolean>;
  oauthLogin: (provider: 'google' | 'apple', token: string) => Promise<boolean>;
  deleteAccount: (password: string) => Promise<boolean>;
  clearAuthError: () => void;
  updateUserProfile: (updates: any) => void;
  
  // Utilities
  canRetryLogin: boolean;
  isAccountLocked: boolean;
  requiresEmailVerification: boolean;
  hasRefreshToken: boolean;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const useAuth = (): UseAuthReturn => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  const [lastFailedAttempt, setLastFailedAttempt] = useState<number | null>(null);

  // Check if account is locked due to too many attempts
  const isAccountLocked = useCallback(() => {
    if (authState.loginAttempts >= MAX_LOGIN_ATTEMPTS && lastFailedAttempt) {
      const timeSinceLastAttempt = Date.now() - lastFailedAttempt;
      return timeSinceLastAttempt < LOCKOUT_DURATION;
    }
    return false;
  }, [authState.loginAttempts, lastFailedAttempt]);

  // Check auth status on mount
  useEffect(() => {
    if (authState.isCheckingAuth) {
      dispatch(checkAuthStatusAsync());
    }
  }, []);

  // Login with email and password
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if account is locked
      if (isAccountLocked()) {
        const remainingTime = Math.ceil((LOCKOUT_DURATION - (Date.now() - (lastFailedAttempt || 0))) / 60000);
        Alert.alert(
          'Account Locked',
          `Too many failed attempts. Please try again in ${remainingTime} minutes.`,
          [{ text: 'OK' }]
        );
        return false;
      }

      // Validate inputs
      if (!email || !password) {
        Alert.alert('Error', 'Please enter both email and password');
        return false;
      }

      const result = await dispatch(loginAsync({ email, password })).unwrap();
      
      if (result) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Check if email verification is required
        if (!result.user.emailVerified && result.requiresVerification) {
          Alert.alert(
            'Email Verification Required',
            'Please verify your email to continue. Check your inbox for the verification link.',
            [
              { text: 'Resend Email', onPress: () => resendVerificationEmail(email) },
              { text: 'OK' }
            ]
          );
          return false;
        }
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      setLastFailedAttempt(Date.now());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Handle specific error cases
      if (error.includes('Invalid credentials')) {
        Alert.alert('Login Failed', 'Invalid email or password');
      } else if (error.includes('not verified')) {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email before logging in.',
          [
            { text: 'Resend Email', onPress: () => resendVerificationEmail(email) },
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert('Login Failed', error || 'An error occurred during login');
      }
      
      return false;
    }
  }, [dispatch, isAccountLocked, lastFailedAttempt]);

  // Signup with email and password
  const signup = useCallback(async (
    email: string,
    password: string,
    username: string,
    marketingConsent?: boolean
  ): Promise<boolean> => {
    try {
      // Validate inputs
      if (!email || !password || !username) {
        Alert.alert('Error', 'Please fill in all required fields');
        return false;
      }

      if (password.length < 8) {
        Alert.alert('Error', 'Password must be at least 8 characters');
        return false;
      }

      const result = await dispatch(signupAsync({ 
        email, 
        password, 
        username, 
        marketingConsent 
      })).unwrap();
      
      if (result) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Show verification reminder
        Alert.alert(
          'Welcome to MindForge!',
          'Please check your email to verify your account and unlock all features.',
          [{ text: 'OK' }]
        );
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      if (error.includes('already exists')) {
        Alert.alert('Signup Failed', 'An account with this email already exists');
      } else if (error.includes('username taken')) {
        Alert.alert('Signup Failed', 'This username is already taken');
      } else {
        Alert.alert('Signup Failed', error || 'An error occurred during signup');
      }
      
      return false;
    }
  }, [dispatch]);

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      await dispatch(logoutAsync()).unwrap();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Logout error:', error);
      // Still perform local logout even if server request fails
    }
  }, [dispatch]);

  // Check auth status
  const checkAuthStatus = useCallback(async (): Promise<void> => {
    try {
      await dispatch(checkAuthStatusAsync()).unwrap();
    } catch (error) {
      console.error('Auth check error:', error);
    }
  }, [dispatch]);

  // Request password reset
  const requestPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    try {
      if (!email) {
        Alert.alert('Error', 'Please enter your email address');
        return false;
      }

      await dispatch(requestPasswordResetAsync({ email })).unwrap();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      Alert.alert(
        'Email Sent',
        'If an account exists with this email, you will receive password reset instructions.',
        [{ text: 'OK' }]
      );
      
      return true;
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to send password reset email');
      return false;
    }
  }, [dispatch]);

  // Reset password with token
  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<boolean> => {
    try {
      if (newPassword.length < 8) {
        Alert.alert('Error', 'Password must be at least 8 characters');
        return false;
      }

      await dispatch(resetPasswordAsync({ token, newPassword })).unwrap();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      Alert.alert(
        'Success',
        'Your password has been reset successfully. Please login with your new password.',
        [{ text: 'OK' }]
      );
      
      return true;
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error || 'Failed to reset password');
      return false;
    }
  }, [dispatch]);

  // Verify email with token
  const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
    try {
      await dispatch(verifyEmailAsync({ token })).unwrap();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Email Verified',
        'Your email has been successfully verified!',
        [{ text: 'OK' }]
      );
      
      return true;
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Verification Failed', error || 'Invalid or expired verification link');
      return false;
    }
  }, [dispatch]);

  // Resend verification email
  const resendVerificationEmail = useCallback(async (email: string): Promise<boolean> => {
    try {
      await dispatch(resendVerificationEmailAsync({ email })).unwrap();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      Alert.alert(
        'Email Sent',
        'A new verification email has been sent to your inbox.',
        [{ text: 'OK' }]
      );
      
      return true;
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send verification email');
      return false;
    }
  }, [dispatch]);

  // OAuth login
  const oauthLogin = useCallback(async (provider: 'google' | 'apple', token: string): Promise<boolean> => {
    try {
      await dispatch(oauthLoginAsync({ provider, token })).unwrap();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return true;
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(`${provider} Login Failed`, error || 'An error occurred during authentication');
      return false;
    }
  }, [dispatch]);

  // Delete account
  const deleteAccount = useCallback(async (password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to delete your account? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await dispatch(deleteAccountAsync({ password })).unwrap();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
                resolve(true);
              } catch (error: any) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Error', error || 'Failed to delete account');
                resolve(false);
              }
            },
          },
        ]
      );
    });
  }, [dispatch]);

  // Clear auth error
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Update user profile
  const updateUserProfile = useCallback((updates: any) => {
    dispatch(updateUser(updates));
  }, [dispatch]);

  return {
    // State
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    isCheckingAuth: authState.isCheckingAuth,
    error: authState.error,
    isEmailVerified: authState.isEmailVerified,
    loginAttempts: authState.loginAttempts,
    
    // Actions
    login,
    signup,
    logout,
    checkAuthStatus,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    oauthLogin,
    deleteAccount,
    clearAuthError,
    updateUserProfile,
    
    // Utilities
    canRetryLogin: !isAccountLocked() && authState.loginAttempts < MAX_LOGIN_ATTEMPTS,
    isAccountLocked: isAccountLocked(),
    requiresEmailVerification: !!authState.user && !authState.isEmailVerified,
    hasRefreshToken: !!authState.refreshToken,
  };
};