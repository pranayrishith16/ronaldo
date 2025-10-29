import axios from 'axios';
import { store } from '../store/store';
import { logout, setAccessToken } from '../store/slices/authSlice';

const API_BASE_URL = 'https://www.api.veritlyai.com'

const api = axios.create({
    baseURL:API_BASE_URL,
    withCredentials:true,
    timeout:30000,
    headers:{
        'Content-Type':'application/json'
    }
})

let refreshPromise = null;

api.interceptors.request.use(
    (config) => {
        const state = store.getState()
        const accessToken = state.auth.accessToken

        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

api.interceptors.response.use(
    (response) => {
      // Check if backend sent a new access token in header
      const newAccessToken = response.headers['x-access-token'];
      if (newAccessToken) {
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
                const { accessToken } = response.data;
                store.dispatch(setAccessToken(accessToken));
                return accessToken;
              })
              .catch((refreshError) => {
                // Refresh failed, logout user
                store.dispatch(logout());
                window.location.href = '/login';
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
          // Refresh failed, redirect to login
          store.dispatch(logout());
          window.location.href = '/login';
          return Promise.reject(refreshError);
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