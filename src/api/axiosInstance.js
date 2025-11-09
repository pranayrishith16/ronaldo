import axios from 'axios';

import { store } from '../store/store';

import { logout, setAccessToken } from '../store/slices/authSlice';

const API_BASE_URL = 'https://www.veritlyai.com'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

let refreshPromise = null;

// ============== UTILITY: JWT DECODER ==============

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000;
    const currentTime = Date.now();
    const bufferTime = 2 * 60 * 1000; // 2 minutes buffer
    return currentTime >= (expiryTime - bufferTime);
  } catch (error) {
    console.error('[API] Error decoding token:', error);
    return true;
  }
};

// ============== REQUEST INTERCEPTOR ==============

api.interceptors.request.use(
  async (config) => {
    const state = store.getState();
    let accessToken = state.auth.accessToken;

    console.log('[API] Request interceptor:');
    console.log('[API] - URL:', config.url);
    console.log('[API] - Token in Redux:', accessToken ? '✅ Present' : '❌ Missing');

    // Skip token handling for login, signup, and refresh endpoints
    const skipAuthEndpoints = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh-token'];
    if (skipAuthEndpoints.some(endpoint => config.url.includes(endpoint))) {
      console.log('[API] - Skipping auth for:', config.url);
      return config;
    }

    // ✅ CHECK IF TOKEN IS EXPIRED BEFORE MAKING REQUEST
    if (accessToken && isTokenExpired(accessToken)) {
      console.log('[API] ⚠️ Token is expired or expiring soon, attempting refresh...');
      try {
        // Prevent multiple simultaneous refresh attempts
        if (!refreshPromise) {
          const state = store.getState();
          const refreshToken = state.auth.refreshToken;
          refreshPromise = api
            .post('/api/auth/refresh-token',{
              refresh_token: refreshToken
            })  // ✅ FIXED: Use correct endpoint
            .then((response) => {
              const newToken = response.data.access_token;
              store.dispatch(setAccessToken(newToken));
              console.log('[API] ✅ Token refreshed proactively');
              return newToken;
            })
            .catch((error) => {
              console.error('[API] ❌ Proactive refresh failed:', error.response?.status);
              throw error;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        accessToken = await refreshPromise;
        console.log('[API] Using refreshed token for request');
      } catch (error) {
        console.error('[API] Failed to refresh token, proceeding with current token');
      }
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('[API] - Authorization header added');
    } else {
      console.warn('[API] - NO TOKEN! Request will likely fail');
    }

    return config;
  },
  (error) => {
    console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ============== RESPONSE INTERCEPTOR ==============

api.interceptors.response.use(
  (response) => {
    const newAccessToken = response.headers['x-access-token'];
    if (newAccessToken) {
      console.log('[API] Backend provided new token in response header');
      store.dispatch(setAccessToken(newAccessToken));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      console.error('[API] Network error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        isNetworkError: true,
      });
    }

    // ✅ FIXED: Handle 401 with correct refresh endpoint
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          const state = store.getState();
          const refreshToken = state.auth.refreshToken;
          refreshPromise = api
            .post('/api/auth/refresh-token',{
              refresh_token: refreshToken
            })  // ✅ FIXED: Use correct endpoint
            .then((response) => {
              const newToken = response.data.access_token;
              store.dispatch(setAccessToken(newToken));
              console.log('[API] ✅ Token refreshed after 401');
              return newToken;
            })
            .catch((refreshError) => {
              const status = refreshError.response?.status;
              console.error('[API] ❌ Refresh failed with status:', status);
              store.dispatch(logout());
              return Promise.reject({
                message: 'Session expired. Please login again.',
                isAuthError: true,
                requiresLogin: true
              });
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newAccessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('[API] Refresh failed, rejecting request');
        return Promise.reject({
          message: 'Session expired. Please login again.',
          isAuthError: true,
          requiresLogin: true
        });
      }
    }

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default api;
