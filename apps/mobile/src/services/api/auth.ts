// ============================================
// src/services/api/auth.ts
// ============================================
import api, { tokenManager } from './client';
import { User } from '../../types/user_types';

// Auth response types
interface LoginResponse {
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

// Auth service class
class AuthService {
  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email: email.toLowerCase().trim(),
        password,
      });

      // Store tokens
      await tokenManager.setTokens(response.accessToken, response.refreshToken);

      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      throw {
        message: error.message || 'Failed to login',
        errors: error.errors || {},
      };
    }
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
    try {
      const response = await api.post<SignupResponse>('/auth/signup', {
        email: email.toLowerCase().trim(),
        password,
        username: username.trim(),
        marketingConsent,
      });

      // Store tokens
      await tokenManager.setTokens(response.accessToken, response.refreshToken);

      return response;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw {
        message: error.message || 'Failed to create account',
        errors: error.errors || {},
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = await tokenManager.getRefreshToken();
      
      // Notify server about logout (optional, for token invalidation)
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken }).catch(err => {
          console.log('Server logout failed:', err);
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local tokens
      await tokenManager.clearTokens();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = await tokenManager.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post<RefreshTokenResponse>('/auth/refresh', {
        refreshToken,
      });

      // Update tokens
      await tokenManager.setTokens(response.accessToken, response.refreshToken);

      return response;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      // Clear tokens on refresh failure
      await tokenManager.clearTokens();
      throw {
        message: 'Session expired. Please login again.',
        requiresLogin: true,
      };
    }
  }

  /**
   * Send password reset email
   */
  async requestPasswordReset(email: string): Promise<ResetPasswordResponse> {
    try {
      const response = await api.post<ResetPasswordResponse>('/auth/password-reset', {
        email: email.toLowerCase().trim(),
      });

      return response;
    } catch (error: any) {
      console.error('Password reset request error:', error);
      throw {
        message: error.message || 'Failed to send reset email',
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    try {
      const response = await api.post<ResetPasswordResponse>('/auth/password-reset/confirm', {
        token,
        newPassword,
      });

      return response;
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw {
        message: error.message || 'Failed to reset password',
      };
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    try {
      const response = await api.post<VerifyEmailResponse>('/auth/verify-email', {
        token,
      });

      return response;
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw {
        message: error.message || 'Failed to verify email',
      };
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<VerifyEmailResponse> {
    try {
      const response = await api.post<VerifyEmailResponse>('/auth/resend-verification', {
        email: email.toLowerCase().trim(),
      });

      return response;
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw {
        message: error.message || 'Failed to resend verification email',
      };
    }
  }

  /**
   * Change user password
   */
  async changePassword(request: ChangePasswordRequest): Promise<ResetPasswordResponse> {
    try {
      const response = await api.post<ResetPasswordResponse>('/auth/change-password', request);
      return response;
    } catch (error: any) {
      console.error('Change password error:', error);
      throw {
        message: error.message || 'Failed to change password',
        errors: error.errors || {},
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  async checkAuthStatus(): Promise<User | null> {
    try {
      const token = await tokenManager.getAccessToken();
      
      if (!token) {
        return null;
      }

      const response = await api.get<User>('/auth/me');
      return response;
    } catch (error: any) {
      console.error('Auth check error:', error);
      
      // If auth check fails, clear tokens
      if (error.status === 401) {
        await tokenManager.clearTokens();
      }
      
      return null;
    }
  }

  /**
   * OAuth login
   */
  async oauthLogin(provider: 'google' | 'apple', token: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>(`/auth/oauth/${provider}`, {
        token,
      });

      // Store tokens
      await tokenManager.setTokens(response.accessToken, response.refreshToken);

      return response;
    } catch (error: any) {
      console.error('OAuth login error:', error);
      throw {
        message: error.message || `Failed to login with ${provider}`,
      };
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>('/auth/account', {
        data: { password },
      });

      // Clear tokens after account deletion
      await tokenManager.clearTokens();

      return response;
    } catch (error: any) {
      console.error('Delete account error:', error);
      throw {
        message: error.message || 'Failed to delete account',
      };
    }
  }
}

// Create singleton instance
const authService = new AuthService();

// Export singleton
export default authService;