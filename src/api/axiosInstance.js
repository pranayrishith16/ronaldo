import axios from 'axios';
import { store } from '../store/store';
import { logout, setAccessToken } from '../store/slices/authSlice';

const API_BASE_URL = 'https://api.veritlyai.com'

const api = axios.create({
    baseURL:API_BASE_URL,
    withCredentials:true,
    timeout:30000,
    headers:{
        'Content-Type':'application/json'
    }
})

let refreshPromise = null;

// ============== UTILITY: JWT DECODER ==============
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const bufferTime = 2 * 60 * 1000; // 2 minutes buffer
    
    return currentTime >= (expiryTime - bufferTime);
  } catch (error) {
    console.error('[API] Error decoding token:', error);
    return true; // Treat invalid tokens as expired
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
    const skipAuthEndpoints = ['/auth/login', '/auth/signup', '/auth/refresh'];
    if (skipAuthEndpoints.some(endpoint => config.url.includes(endpoint))) {
      console.log('[API] - Skipping auth for:', config.url);
      return config;
    }
    
    // ✅ CHECK IF TOKEN IS EXPIRED BEFORE MAKING REQUEST
    if (accessToken && isTokenExpired(accessToken)) {
      console.log('[API] ⚠️ Token is expired or expiring soon, refreshing...');
      
      try {
        // Prevent multiple simultaneous refresh attempts
        if (!refreshPromise) {
          refreshPromise = api
            .post('/auth/refresh')
            .then((response) => {
              const newToken = response.data.access_token;
              store.dispatch(setAccessToken(newToken));
              console.log('[API] ✅ Token refreshed proactively');
              return newToken;
            })
            .catch((error) => {
              console.error('[API] ❌ Proactive refresh failed:', error);
              throw error;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }
        
        // Wait for refresh to complete
        accessToken = await refreshPromise;
        console.log('[API] Using refreshed token for request');
        
      } catch (error) {
        console.error('[API] Failed to refresh token, request may fail');
        // Don't block the request, let it proceed and handle 401 in response interceptor
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
      // Check if backend sent a new access token in header
      const newAccessToken = response.headers['x-access-token'];
      if (newAccessToken) {
        console.log('[API] Backend provided new token in response header');
        store.dispatch(setAccessToken(newAccessToken));
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
  
      // If request failed due to network error
      if (!error.response) {
        console.error('Network error:', error.message);
        return Promise.reject({
          message: 'Network error. Please check your internet connection.',
          isNetworkError: true,
        });
      }
  
      // If we get 401 and haven't already tried to refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
  
        try {
          // Prevent multiple simultaneous refresh attempts
          if (!refreshPromise) {
            refreshPromise = api
              .post('/auth/refresh')
              .then((response) => {
                const newToken = response.data.access_token;
                store.dispatch(setAccessToken(newToken));
                console.log('[API] ✅ Token refreshed after 401');
                return newToken;
              })
              .catch((refreshError) => {
                // Refresh failed, logout user
                console.error('[API] ❌ Token refresh failed, logging out');
                store.dispatch(logout());
                
                // Let the app's routing handle navigation
                // Don't use window.location.href here
                throw refreshError;
              })
              .finally(() => {
                refreshPromise = null;
              });
          }
  
          // Wait for the refresh to complete
          const newAccessToken = await refreshPromise;
  
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('[API] Refresh failed, rejecting request');
        
          // Return a specific error so the app can handle logout/redirect
          return Promise.reject({
            message: 'Session expired. Please login again.',
            isAuthError: true,
            requiresLogin: true
          })
        }
      }
  
      // For other errors, pass through with better error messages
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