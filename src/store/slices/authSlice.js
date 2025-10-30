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
        try{
            const response = await api.get('/auth/me');
            return response.data; // { user: {...}, accessToken: ... }
        } catch (error) {
      return rejectWithValue('Not authenticated');
        }
    }
)

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


// ============== INITIAL SETUP ================

const initialState = {
    user:null,
    accessToken:localStorage.getItem('accessToken') || null,
    isLoggedIn: !!localStorage.getItem('accessToken'),
    isLoading:false,
    isAuthChecked:false,
    error:null
}

// ============== AUTH SLICE =================

const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        setAccessToken: (state, action) => {
            state.accessToken = action.payload;
          },

        setUser: (state, action) => {
        state.user = action.payload;
        },

        logout: (state) => {
          state.user = null;
          state.accessToken = null;
          state.isLoggedIn = false;
          state.error = null;
          
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
        // login
        builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.access_token;
        
        localStorage.setItem('accessToken', action.payload.access_token);
        localStorage.setItem('refreshToken', action.payload.refresh_token);
        localStorage.setItem('userId', action.payload.user_id);
        localStorage.setItem('userEmail', action.payload.email);
        localStorage.setItem('userTier', action.payload.tier);
        
        state.user = {
          user_id: action.payload.user_id,
          email: action.payload.email,
          tier: action.payload.tier
        };
        state.isLoggedIn = true;
        state.isAuthChecked = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isLoggedIn = false;
        state.isAuthChecked = true;
      });

    //   signup
      builder
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.access_token;
        localStorage.setItem('accessToken', action.payload.access_token);
        state.user = {
          user_id: action.payload.user_id,
          email: action.payload.email,
          tier: action.payload.tier
        };      
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isLoggedIn = false;
        state.isAuthChecked = true;
      });

    //   check auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken || action.payload.access_token;
        state.isLoggedIn = true;
        state.isAuthChecked = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.isAuthChecked = true;
        state.user = null;
        state.accessToken = null;
      });

    //   refresh token
    builder
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isLoggedIn = false;
        state.user = null;
        state.accessToken = null;
      });

    // ========== LOGOUT ==========
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isLoggedIn = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if backend fails, clear local state
        state.user = null;
        state.accessToken = null;
        state.isLoggedIn = false;
      });
    }
})

export const { setAccessToken, setUser, logout, clearError } = authSlice.actions;
export default authSlice.reducer;