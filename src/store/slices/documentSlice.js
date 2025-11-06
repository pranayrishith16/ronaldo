import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// ✅ NEW: Direct view endpoint (no SAS needed)
export const fetchDocumentUrl = createAsyncThunk(
  'documents/fetchDocumentUrl',
  async (documentPath, { rejectWithValue }) => {
    try {
      console.log('[DOCUMENTS] Building view URL for:', documentPath);
      
      // ✅ CHANGED: Point to /view endpoint instead of /access
      // The streaming happens directly, no SAS URL to fetch
      const viewUrl = `/api/documents/view/${documentPath}`;
      
      console.log('[DOCUMENTS] View URL ready:', viewUrl);
      
      // Return immediately (no HTTP request needed)
      return {
        success: true,
        url: viewUrl,
        blob_path: documentPath,
        expires_in_minutes: 30
      };
    } catch (error) {
      console.error('[DOCUMENTS] Error:', error);
      return rejectWithValue(error.message || 'Failed to prepare document URL');
    }
  }
);

const initialState = {
  documentUrl: null,
  isLoading: false,
  error: null,
  currentDocumentPath: null,
  isViewerOpen: false,
  fileName: null,
};

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearDocumentUrl: (state) => {
      state.documentUrl = null;
      state.currentDocumentPath = null;
      state.error = null;
    },
    closeViewer: (state) => {
      state.isViewerOpen = false;
      state.documentUrl = null;
      state.fileName = null;
    },
    setFileName: (state, action) => {
      state.fileName = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDocumentUrl.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(fetchDocumentUrl.fulfilled, (state, action) => {
      state.isLoading = false;
      state.documentUrl = action.payload.url;
      state.currentDocumentPath = action.payload.blob_path;
      state.error = null;
      state.isViewerOpen = true;
      console.log('[DOCUMENTS] View URL ready, opening viewer');
    });

    builder.addCase(fetchDocumentUrl.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to prepare document';
      console.error('[DOCUMENTS] Error:', state.error);
    });
  },
});

export const { clearDocumentUrl, closeViewer, setFileName } = documentSlice.actions;
export default documentSlice.reducer;
