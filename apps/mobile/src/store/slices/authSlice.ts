// ============================================
// src/store/slices/authSlice.ts
// ============================================
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from '../../services/api/auth';
import { storageService } from '../../services/storage/asyncStorage';
import { User } from '../../types/user_types';

// Auth State Interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  lastLoginAt: string | null;
  loginAttempts: number;
  isEmailVerified: boolean;
  resetPasswordEmailSent: boolean;
}

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,
  accessToken: null,
  refreshToken: null,
  lastLoginAt: null,
  loginAttempts: 0,
  isEmailVerified: false,
  resetPasswordEmailSent: false,
};

// Async Thunks

// Login
export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      
      // Store last login time
      await storageService.set('lastLoginAt', new Date().toISOString());
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Signup
export const signupAsync = createAsyncThunk(
  'auth/signup',
  async (
    { 
      email, 
      password, 
      username,
      marketingConsent 
    }: { 
      email: string; 
      password: string; 
      username: string;
      marketingConsent?: boolean;
    }, 
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.signup(email, password, username, marketingConsent);
      
      // Mark onboarding as needed for new users
      await storageService.set('needsOnboarding', true);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Signup failed');
    }
  }
);

// Logout
export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await authService.logout();
      
      // Clear local storage (except onboarding status)
      const onboardingComplete = await storageService.isOnboardingComplete();
      await storageService.clear();
      if (onboardingComplete) {
        await storageService.setOnboardingComplete();
      }
      
      // Clear other slices if needed
      // dispatch(clearUserData());
      // dispatch(clearCardsData());
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return true; // Still logout locally even if server request fails
    }
  }
);

// Check Auth Status
export const checkAuthStatusAsync = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.checkAuthStatus();
      
      if (user) {
        return { user, isAuthenticated: true };
      } else {
        return { user: null, isAuthenticated: false };
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Auth check failed');
    }
  }
);

// Request Password Reset
export const requestPasswordResetAsync = createAsyncThunk(
  'auth/requestPasswordReset',
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      const response = await authService.requestPasswordReset(email);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send reset email');
    }
  }
);

// Reset Password
export const resetPasswordAsync = createAsyncThunk(
  'auth/resetPassword',
  async (
    { token, newPassword }: { token: string; newPassword: string }, 
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.resetPassword(token, newPassword);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reset password');
    }
  }
);

// Verify Email
export const verifyEmailAsync = createAsyncThunk(
  'auth/verifyEmail',
  async ({ token }: { token: string }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyEmail(token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Email verification failed');
    }
  }
);

// Resend Verification Email
export const resendVerificationEmailAsync = createAsyncThunk(
  'auth/resendVerification',
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      const response = await authService.resendVerificationEmail(email);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to resend verification email');
    }
  }
);

// OAuth Login
export const oauthLoginAsync = createAsyncThunk(
  'auth/oauthLogin',
  async (
    { provider, token }: { provider: 'google' | 'apple'; token: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.oauthLogin(provider, token);
      
      // Store last login time
      await storageService.set('lastLoginAt', new Date().toISOString());
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || `${provider} login failed`);
    }
  }
);

// Delete Account
export const deleteAccountAsync = createAsyncThunk(
  'auth/deleteAccount',
  async ({ password }: { password: string }, { rejectWithValue, dispatch }) => {
    try {
      const response = await authService.deleteAccount(password);
      
      // Clear all local data
      await storageService.clear();
      
      // Dispatch logout to reset state
      dispatch(logout());
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete account');
    }
  }
);

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Manual logout (without API call)
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      state.lastLoginAt = null;
      state.loginAttempts = 0;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Update tokens
    refreshTokenSuccess: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    
    // Update user
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    // Set email verified
    setEmailVerified: (state, action: PayloadAction<boolean>) => {
      state.isEmailVerified = action.payload;
      if (state.user) {
        // Update user object if needed
      }
    },
    
    // Increment login attempts
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
    },
    
    // Reset login attempts
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.lastLoginAt = new Date().toISOString();
        state.loginAttempts = 0;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.loginAttempts += 1;
      });
    
    // Signup
    builder
      .addCase(signupAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.lastLoginAt = new Date().toISOString();
        state.error = null;
      })
      .addCase(signupAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        return { ...initialState, isCheckingAuth: false };
      })
      .addCase(logoutAsync.rejected, (state) => {
        // Still logout even if server request fails
        return { ...initialState, isCheckingAuth: false };
      });
    
    // Check Auth Status
    builder
      .addCase(checkAuthStatusAsync.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAuthStatusAsync.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
      })
      .addCase(checkAuthStatusAsync.rejected, (state) => {
        state.isCheckingAuth = false;
        state.isAuthenticated = false;
        state.user = null;
      });
    
    // Request Password Reset
    builder
      .addCase(requestPasswordResetAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.resetPasswordEmailSent = false;
      })
      .addCase(requestPasswordResetAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.resetPasswordEmailSent = true;
        state.error = null;
      })
      .addCase(requestPasswordResetAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.resetPasswordEmailSent = false;
      });
    
    // Reset Password
    builder
      .addCase(resetPasswordAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPasswordAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Verify Email
    builder
      .addCase(verifyEmailAsync.fulfilled, (state) => {
        state.isEmailVerified = true;
      });
    
    // OAuth Login
    builder
      .addCase(oauthLoginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(oauthLoginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.lastLoginAt = new Date().toISOString();
        state.error = null;
      })
      .addCase(oauthLoginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Delete Account
    builder
      .addCase(deleteAccountAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccountAsync.fulfilled, () => {
        return initialState;
      })
      .addCase(deleteAccountAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { 
  logout, 
  clearError, 
  refreshTokenSuccess, 
  updateUser,
  setEmailVerified,
  incrementLoginAttempts,
  resetLoginAttempts
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;