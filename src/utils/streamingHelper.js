import { store } from '../store/store';
import { refreshAccessToken, logout } from '../store/slices/authSlice';


const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const currentTime = Date.now();
      const bufferTime = 2 * 60 * 1000; // 2 minutes buffer
      
      return currentTime >= (expiryTime - bufferTime);
    } catch (error) {
      console.error('[STREAM] Error decoding token:', error);
      return true;
    }
  };

  export const getValidToken = async () => {
    const state = store.getState();
    let accessToken = state.auth.accessToken;
    
    console.log('[STREAM] Getting valid token...');
    console.log('[STREAM] Current token exists:', !!accessToken);
    
    if (!accessToken) {
      console.error('[STREAM] No access token found');
      throw new Error('No access token available');
    }
    
    // Check if token is expired
    if (isTokenExpired(accessToken)) {
      console.log('[STREAM] Token is expired, refreshing...');
      
      try {
        // Dispatch refresh action and wait for it
        const result = await store.dispatch(refreshAccessToken()).unwrap();
        console.log('[STREAM] ✅ Token refreshed successfully');
        return result; // Return the new token
      } catch (error) {
        console.error('[STREAM] ❌ Failed to refresh token:', error);
        
        // Logout user on refresh failure
        store.dispatch(logout());
        
        throw new Error('Session expired. Please login again.');
      }
    }
    
    console.log('[STREAM] ✅ Using existing valid token');
    return accessToken;
  };
  
  /**
   * Create a streaming request with proper token handling
   * @param {string} url - API endpoint URL
   * @param {object} options - Fetch options
   * @param {Function} onMessage - Callback for each streamed message
   * @param {Function} onError - Callback for errors
   * @param {Function} onComplete - Callback when stream completes
   */
  export const createStreamingRequest = async (
    url,
    options = {},
    onMessage,
    onError,
    onComplete
  ) => {
    try {
      // Get a valid token (will refresh if needed)
      const token = await getValidToken();
      
      console.log('[STREAM] Starting streaming request to:', url);
      
      // Create the fetch request with token
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[STREAM] Request failed:', response.status, errorText);
        
        // Handle 401 specifically
        if (response.status === 401) {
          console.log('[STREAM] Received 401, attempting token refresh and retry...');
          
          try {
            // Try to refresh token
            const newToken = await store.dispatch(refreshAccessToken()).unwrap();
            
            // Retry the request with new token
            const retryResponse = await fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (!retryResponse.ok) {
              throw new Error(`Request failed with status: ${retryResponse.status}`);
            }
            
            // Continue with the retry response
            return handleStreamResponse(retryResponse, onMessage, onError, onComplete);
            
          } catch (refreshError) {
            console.error('[STREAM] Token refresh failed on retry');
            store.dispatch(logout());
            throw new Error('Session expired. Please login again.');
          }
        }
        
        throw new Error(`Request failed with status: ${response.status}`);
      }
      
      return handleStreamResponse(response, onMessage, onError, onComplete);
      
    } catch (error) {
      console.error('[STREAM] Streaming request error:', error);
      onError?.(error);
      throw error;
    }
  };
  
  /**
   * Handle the streaming response
   */
  const handleStreamResponse = async (response, onMessage, onError, onComplete) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('[STREAM] Stream completed');
          onComplete?.();
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              console.log('[STREAM] Received [DONE] marker');
              onComplete?.();
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              onMessage?.(parsed);
            } catch (e) {
              // Not JSON, might be plain text
              onMessage?.({ content: data });
            }
          }
        }
      }
    } catch (error) {
      console.error('[STREAM] Error reading stream:', error);
      onError?.(error);
      throw error;
    }
  };
  
  export default {
    getValidToken,
    createStreamingRequest
  };