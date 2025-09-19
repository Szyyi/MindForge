// ============================================
// src/services/api/auth.ts
// ============================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, SubscriptionTier } from '../../types/user_types';

// Toggle this to false when you have a real backend
const USE_MOCK_AUTH = true;

// Auth response types
interface LoginResponse {
  requiresVerification: boolean;
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface SignupResponse extends LoginResponse {}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

interface VerifyEmailResponse {
  message: string;
  success: boolean;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Token manager for mock implementation
const mockTokenManager = {
  async setTokens(accessToken: string, refreshToken: string) {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
  },
  async getAccessToken() {
    return AsyncStorage.getItem('accessToken');
  },
  async getRefreshToken() {
    return AsyncStorage.getItem('refreshToken');
  },
  async clearTokens() {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  }
};

// Mock user generator with correct User type structure
const createMockUser = (email: string, username?: string): User => ({
  id: `user_${Date.now()}`,
  email: email.toLowerCase().trim(),
  username: username || email.split('@')[0],
  avatar: undefined, // Optional field
  subscription: SubscriptionTier.FREE,
  stats: {
    streak: 0,
    totalReviews: 0,
    cardsLearned: 0,
    minutesStudied: 0,
    retentionRate: 0,
    level: 1,
    xp: 0,
  },
  preferences: {
    dailyGoal: 20,
    notificationTime: '09:00',
    soundEnabled: true,
    hapticEnabled: true,
    theme: 'dark',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  emailVerified: undefined
});

// Simulate network delay
const mockDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Auth service class
class AuthService {
  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    if (USE_MOCK_AUTH) {
      // Mock implementation
      await mockDelay();
      
      const mockUser = createMockUser(email);
      const mockResponse: LoginResponse = {
        user: mockUser,
        accessToken: `mock_access_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
        requiresVerification: false
      };
      
      // Store tokens and user
      await mockTokenManager.setTokens(mockResponse.accessToken, mockResponse.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      
      console.log('Mock login successful for:', email);
      return mockResponse;
    }
    
    // Real implementation would go here
    // When you have a backend, add the real API call here
    throw new Error('Real backend not configured yet');
  }

  /**
   * Sign up new user
   */
  async signup(
    email: string, 
    password: string, 
    username: string,
    marketingConsent: boolean = false
  ): Promise<SignupResponse> {
    if (USE_MOCK_AUTH) {
      // Mock implementation
      await mockDelay();
      
      const mockUser = createMockUser(email, username);
      const mockResponse: SignupResponse = {
        user: mockUser,
        accessToken: `mock_access_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
        requiresVerification: false
      };
      
      // Store tokens and user
      await mockTokenManager.setTokens(mockResponse.accessToken, mockResponse.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      
      console.log('Mock signup successful for:', email);
      return mockResponse;
    }
    
    // Real implementation would go here
    throw new Error('Real backend not configured yet');
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    if (USE_MOCK_AUTH) {
      await mockDelay(500);
      await mockTokenManager.clearTokens();
      console.log('Mock logout successful');
      return;
    }
    
    // Real implementation would go here
    throw new Error('Real backend not configured yet');
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    if (USE_MOCK_AUTH) {
      await mockDelay(500);
      
      const refreshToken = await mockTokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const newTokens = {
        accessToken: `mock_access_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
      };
      
      await mockTokenManager.setTokens(newTokens.accessToken, newTokens.refreshToken);
      return newTokens;
    }
    
    // Real implementation would go here
    throw new Error('Real backend not configured yet');
  }

  /**
   * Send password reset email
   */
  async requestPasswordReset(email: string): Promise<ResetPasswordResponse> {
    if (USE_MOCK_AUTH) {
      await mockDelay();
      console.log('Mock password reset email sent to:', email);
      return {
        message: 'Password reset email sent (mock)',
        success: true,
      };
    }
    
    // Real implementation would go here
    throw new Error('Real backend not configured yet');
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    if (USE_MOCK_AUTH) {
      await mockDelay();
      console.log('Mock password reset successful');
      return {
        message: 'Password reset successfully (mock)',
        success: true,
      };
    }
    
    // Real implementation would go here
    throw new Error('Real backend not configured yet');
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    if (USE_MOCK_AUTH) {
      await mockDelay();
      console.log('Mock email verification successful');
      return {
        message: 'Email verified successfully (mock)',
        success: true,
      };
    }
    
    // Real implementation would go here
    throw new Error('Real backend not configured yet');
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<VerifyEmailResponse> {
    if (USE_MOCK_AUTH) {
      await mockDelay();
      console.log('Mock verification email resent to:', email);
      return {
        message: 'Verification email sent (mock)',
        success: true,
      };
    }
    
    // Real implementation would go here
    throw new Error('Real backend not configured yet');
  }

  /**
   * Change user password
   */
  async changePassword(request: ChangePasswordRequest): Promise<ResetPasswordResponse> {
    if (USE_MOCK_AUTH) {
      await mockDelay();
      console.log('Mock password change successful');
      return {
        message: 'Password changed successfully (mock)',
        success: true,
      };
    }
    
    // Real implementation would go here
    throw new Error('Real backend not configured yet');
  }

  /**
   * Check if user is authenticated
   */
  async checkAuthStatus(): Promise<User | null> {
    if (USE_MOCK_AUTH) {
      await mockDelay(200);
      
      const token = await mockTokenManager.getAccessToken();
      if (!token) {
        return null;
      }
      
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        // Convert date strings back to Date objects
        return {
          ...userData,
          createdAt: new Date(userData.createdAt),
          updatedAt: new Date(userData.updatedAt),
        } as User;
      }
      
      return null;
    }
    
    // Real implementation would go here
    throw new Error('Real backend not configured yet');
  }

  /**
   * OAuth login
   */
  async oauthLogin(provider: 'google' | 'apple', token: string): Promise<LoginResponse> {
    if (USE_MOCK_AUTH) {
      await mockDelay();
      
      const mockUser = createMockUser(`${provider}.user@example.com`, `${provider}_user`);
      const mockResponse: LoginResponse = {
        user: mockUser,
        accessToken: `mock_access_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
        requiresVerification: false
      };
      
      await mockTokenManager.setTokens(mockResponse.accessToken, mockResponse.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      
      console.log(`Mock ${provider} OAuth login successful`);
      return mockResponse;
    }
    
    // Real implementation would go here
    throw new Error('Real backend not configured yet');
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_AUTH) {
      await mockDelay();
      await mockTokenManager.clearTokens();
      console.log('Mock account deletion successful');
      return {
        success: true,
        message: 'Account deleted successfully (mock)',
      };
    }
    
    // Real implementation would go here
    throw new Error('Real backend not configured yet');
  }
}

// Create singleton instance
const authService = new AuthService();

// Export singleton
export default authService;