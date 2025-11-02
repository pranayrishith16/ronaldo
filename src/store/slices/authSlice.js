import { createSlice, createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import api from '../../api/axiosInstance'

// ============== UTILITY: JWT DECODER ==============
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    
    return currentTime >= (expiryTime - bufferTime);
  } catch (error) {
    console.error('[AUTH] Error decoding token:', error);
    return true; // Treat invalid tokens as expired
  }
};

// ========= LOGIN =========

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({email,password},{rejectWithValue}) => {
        try{
            const response = await api.post('/auth/login',{email,password})

            return response.data
        } catch (error){
            return rejectWithValue(
                error.response?.data?.message || 'Login failed, Please try again'
            )
        }
    }
)

// ========= SIGNUP ===========

export const signupUser = createAsyncThunk(
    'auth/signupUser',
    async ({fullName, email, password},{rejectWithValue}) => {
        try{
            const response = await api.post('/auth/signup',{fullName,email,password})

            return response.data
        } catch(error){
            return rejectWithValue(
                error.response?.data?.message || 'Signup failed, Please try again'
            )
        }
    }
)

// =========== REFRESH TOKEN ==============

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[AUTH] Refreshing access token...');
      const response = await api.post('/auth/refresh-token');
      console.log('[AUTH] Token refresh successful');
      return response.data.access_token;
    } catch (error) {
      console.error('[AUTH] Token refresh failed:', error);
      return rejectWithValue('Session expired. Please login again.');
    }
  }
);

// ======== CHECK AUTH (on startup) ==========

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, {rejectWithValue, dispatch}) => {
    try {
      console.log('[AUTH] Checking auth from localStorage...');
      
      const accessToken = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const userTier = localStorage.getItem('userTier');
      
      console.log('[AUTH] localStorage check:');
      console.log('[AUTH] - accessToken:', accessToken ? '✅ Present' : '❌ Missing');
      console.log('[AUTH] - userId:', userId ? '✅ Present' : '❌ Missing');
      
      if (!accessToken || !userId) {
        console.log('[AUTH] No valid tokens in localStorage');
        return rejectWithValue('No stored tokens');
      }
      
      // ✅ CHECK IF TOKEN IS EXPIRED
      if (isTokenExpired(accessToken)) {
        console.log('[AUTH] Token is expired, attempting refresh...');
        
        try {
          // Attempt to refresh the token
          const newToken = await dispatch(refreshAccessToken()).unwrap();
          
          console.log('[AUTH] ✅ Token refreshed successfully during checkAuth');
          
          // Return user data with new token
          return {
            user: {
              user_id: userId,
              email: userEmail,
              tier: userTier
            },
            accessToken: newToken
          };
        } catch (refreshError) {
          console.error('[AUTH] Failed to refresh token during checkAuth:', refreshError);
          // Clear localStorage on refresh failure
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userId');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userTier');
          return rejectWithValue('Token expired and refresh failed');
        }
      }
      
      console.log('[AUTH] ✅ Valid token found in localStorage');
      
      // Return user data from localStorage
      return {
        user: {
          user_id: userId,
          email: userEmail,
          tier: userTier
        },
        accessToken: accessToken
      };
      
    } catch (error) {
      console.error('[AUTH] checkAuth error:', error);
      return rejectWithValue('Auth check failed');
    }
  }
);


// ============== INITIAL SETUP ================
// ✅ Load tokens from localStorage on app start

const getInitialState = () => {
  const accessToken = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId');
  
  console.log('[AUTH] Initial state - loading from localStorage');
  console.log('[AUTH]   - accessToken:', accessToken ? '✅ Present' : '❌ Missing');
  console.log('[AUTH]   - userId:', userId ? '✅ Present' : '❌ Missing');
  
  return {
    user: null,
    accessToken: accessToken || null,
    isLoggedIn: !!(accessToken && userId),
    isLoading: false,
    isAuthChecked: false,
    error: null
  };
};

const initialState = getInitialState();

// ============== LOGOUT ================

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      return null;
    } catch (error) {
      console.warn('[AUTH] Logout request failed, but clearing local state anyway');
      return null
    }
  }
);

// ============== AUTH SLICE =================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
      console.log('[AUTH] setAccessToken called');
      state.accessToken = action.payload;
      localStorage.setItem('accessToken', action.payload);
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      console.log('[AUTH] Logging out');
      state.user = null;
      state.accessToken = null;
      state.isLoggedIn = false;
      state.error = null;
      
      // ✅ Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userTier');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ===== LOGIN =====
    builder
      .addCase(loginUser.pending, (state) => {
        console.log('[AUTH] loginUser.pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('[AUTH] loginUser.fulfilled');
        console.log('[AUTH] Response:', action.payload);
        
        state.isLoading = false;
        
        // ✅ FIXED: Use correct field names from backend
        const token = action.payload.access_token;
        const refreshToken = action.payload.refresh_token;
        const userId = action.payload.user_id;
        const email = action.payload.email;
        const tier = action.payload.tier;
        
        state.accessToken = token;
        
        // ✅ Save ALL to localStorage
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userTier', tier);
        
        console.log('[AUTH] Saved to localStorage:');
        console.log('[AUTH]   - accessToken: ✅');
        console.log('[AUTH]   - userId:', userId);
        
        state.user = {
          user_id: userId,
          email: email,
          tier: tier
        };
        
        state.isLoggedIn = true;
        state.isAuthChecked = true;
        state.error = null;
        
        console.log('[AUTH] Login complete - isLoggedIn:', state.isLoggedIn);
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log('[AUTH] loginUser.rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload;
        state.isLoggedIn = false;
        state.isAuthChecked = true;
      });

    // ===== SIGNUP =====
    builder
      .addCase(signupUser.pending, (state) => {
        console.log('[AUTH] signupUser.pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        console.log('[AUTH] signupUser.fulfilled');
        
        state.isLoading = false;
        
        // ✅ FIXED: Use correct field names
        const token = action.payload.access_token;
        const refreshToken = action.payload.refresh_token;
        const userId = action.payload.user_id;
        const email = action.payload.email;
        const tier = action.payload.tier;
        
        state.accessToken = token;
        
        // ✅ Save to localStorage
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userTier', tier);
        
        state.user = {
          user_id: userId,
          email: email,
          tier: tier
        };
        
        state.isLoggedIn = true;
        state.isAuthChecked = true;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        console.log('[AUTH] signupUser.rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload;
        state.isLoggedIn = false;
        state.isAuthChecked = true;
      });

    // ===== CHECK AUTH (No backend call) =====
    builder
      .addCase(checkAuth.pending, (state) => {
        console.log('[AUTH] checkAuth.pending');
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        console.log('[AUTH] ✅ checkAuth.fulfilled');
        console.log('[AUTH] User data:', action.payload.user);
        
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isLoggedIn = true;
        state.isAuthChecked = true;
        
        console.log('[AUTH] State after checkAuth:');
        console.log('[AUTH]   - isLoggedIn:', state.isLoggedIn);
        console.log('[AUTH]   - isAuthChecked:', state.isAuthChecked);
        console.log('[AUTH]   - user:', state.user);
      })
      .addCase(checkAuth.rejected, (state, action) => {
        console.log('[AUTH] ❌ checkAuth.rejected:', action.payload);
        
        state.isLoading = false;
        state.isLoggedIn = false;
        state.isAuthChecked = true;  // ✅ CRITICAL: Must set true even on failure
        state.user = null;
        state.accessToken = null;
      });
    
    // ===== REFRESH TOKEN =====
    builder
    .addCase(refreshAccessToken.pending, (state) => {
      console.log('[AUTH] refreshAccessToken.pending');
      // Don't set isLoading to true to avoid UI disruption
    })
    .addCase(refreshAccessToken.fulfilled, (state, action) => {
      console.log('[AUTH] ✅ refreshAccessToken.fulfilled');
      
      const newToken = action.payload;
      state.accessToken = newToken;
      
      // ✅ Update localStorage
      localStorage.setItem('accessToken', newToken);
      
      console.log('[AUTH] New token saved to state and localStorage');
    })
    .addCase(refreshAccessToken.rejected, (state, action) => {
      console.log('[AUTH] ❌ refreshAccessToken.rejected:', action.payload);
      
      // Token refresh failed - logout user
      state.user = null;
      state.accessToken = null;
      state.isLoggedIn = false;
      state.error = action.payload;
      
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userTier');
    });

    // ===== LOGOUT =====
    builder
      .addCase(logoutUser.pending, (state) => {
        console.log('[AUTH] logoutUser.pending');
      })
      .addCase(logoutUser.fulfilled, (state) => {
        console.log('[AUTH] ✅ logoutUser.fulfilled');
        
        state.user = null;
        state.accessToken = null;
        state.isLoggedIn = false;
        state.error = null;
        
        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userTier');
      })
      .addCase(logoutUser.rejected, (state) => {
        console.log('[AUTH] logoutUser.rejected - clearing state anyway');
        
        // Even if logout fails, clear local state
        state.user = null;
        state.accessToken = null;
        state.isLoggedIn = false;
        state.error = null;
        
        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userTier');
      });
  }
});

export const { setAccessToken, setUser, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
