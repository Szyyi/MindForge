// ============================================
// src/services/api/client.ts
// ============================================
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { store } from '../../store';
import { logout, refreshTokenSuccess } from '../../store/slices/authSlice';

// Extend the InternalAxiosRequestConfig to include metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: { startTime: number };
  }
}

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api/v1'  // Development
  : 'https://api.mindforge.app/v1'; // Production

const API_TIMEOUT = 30000; // 30 seconds

// Token keys in AsyncStorage
const ACCESS_TOKEN_KEY = '@mindforge/access_token';
const REFRESH_TOKEN_KEY = '@mindforge/refresh_token';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Token management utilities
export const tokenManager = {
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
      ]);
    } catch (error) {
      console.error('Error setting tokens:', error);
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },
};

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return Promise.reject(new Error('No internet connection'));
    }

    // Add auth token to headers
    const token = await tokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for tracking
    config.metadata = { startTime: new Date().getTime() };

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Log request duration in dev mode
    if (__DEV__ && response.config.metadata) {
      const duration = new Date().getTime() - response.config.metadata.startTime;
      console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        isNetworkError: true,
      });
    }

    // Handle 401 Unauthorized - Token refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for token refresh to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        await tokenManager.setTokens(accessToken, newRefreshToken);
        store.dispatch(refreshTokenSuccess({ accessToken, refreshToken: newRefreshToken }));
        
        onTokenRefreshed(accessToken);
        isRefreshing = false;

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        // Refresh failed - logout user
        await tokenManager.clearTokens();
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    // Handle other error status codes
    const errorResponse = {
      status: error.response.status,
      message: (error.response.data as any)?.message || 'An error occurred',
      errors: (error.response.data as any)?.errors || {},
    };

    return Promise.reject(errorResponse);
  }
);

// API wrapper with retry logic
export const apiRequest = async <T>(
  config: AxiosRequestConfig,
  retries = 3
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await apiClient(config);
      return response.data;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry for client errors (4xx) except 429 (rate limit)
      if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }
      
      // Exponential backoff for retries
      if (i < retries - 1) {
        const delay = Math.min(1000 * Math.pow(2, i), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Convenience methods
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'GET', url }),
    
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'POST', url, data }),
    
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'PUT', url, data }),
    
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),
    
  delete: <T>(url: string, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'DELETE', url }),
};

// Export the raw client for advanced use cases
export { apiClient };

// Export default
export default api;