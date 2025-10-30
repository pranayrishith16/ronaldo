import { createSlice, createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import api from '../../api/axiosInstance'

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

// ======== CHECK AUTH (on startup) ==========

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, {rejectWithValue}) => {
    try {
      console.log('[AUTH] Checking auth from localStorage...');
      
      // ✅ Just verify token exists in localStorage
      // No backend call needed!
      const accessToken = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const userTier = localStorage.getItem('userTier');
      
      console.log('[AUTH] localStorage check:');
      console.log('[AUTH]   - accessToken:', accessToken ? '✅ Present' : '❌ Missing');
      console.log('[AUTH]   - userId:', userId ? '✅ Present' : '❌ Missing');
      
      if (!accessToken || !userId) {
        console.log('[AUTH] No valid tokens in localStorage');
        return rejectWithValue('No stored tokens');
      }
      
      console.log('[AUTH] ✅ Valid tokens found in localStorage');
      
      // ✅ Return user data from localStorage
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
    isLoggedIn: !!(accessToken && userId),  // ✅ Logged in if both exist
    isLoading: false,
    isAuthChecked: false,
    error: null
  };
};

const initialState = getInitialState();


// =========== REFRESH TOKEN ==============

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/refresh');
      return response.data.accessToken;
    } catch (error) {
      return rejectWithValue('Session expired. Please login again.');
    }
  }
);

// ============== LOGOUT ================

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      return null;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

// ============== AUTH SLICE =================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
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
  }
});

export const { setAccessToken, setUser, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
