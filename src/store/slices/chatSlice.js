import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../api/axiosInstance';

// ============ ASYNC THUNKS ============

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[CHAT] Fetching conversations...');
      const response = await api.get('/conversations');
      console.log('[CHAT] ✅ Conversations fetched:', response.data);
      return response.data.conversations || [];
    } catch (error) {
      console.error('[CHAT] ❌ Error fetching conversations:', error);
      return rejectWithValue(error.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchConversationMessages = createAsyncThunk(
  'chat/fetchConversationMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      console.log('[CHAT] Fetching messages for:', conversationId);
      const response = await api.get(`/conversations/${conversationId}/messages`);
      console.log('[CHAT] ✅ Messages fetched:', response.data);
      return {
        conversationId,
        messages: response.data.messages || [],
      };
    } catch (error) {
      console.error('[CHAT] ❌ Error fetching messages:', error);
      return rejectWithValue(error.message || 'Failed to fetch messages');
    }
  }
);

export const createNewConversation = createAsyncThunk(
  'chat/createNewConversation',
  async ({ title }, { rejectWithValue }) => {
    try {
      console.log('[CHAT] Creating new conversation:', title);
      const response = await api.post('/conversations', { title });
      console.log('[CHAT] ✅ Conversation created:', response.data);
      return response.data.conversation;
    } catch (error) {
      console.error('[CHAT] ❌ Error creating conversation:', error);
      return rejectWithValue(error.message || 'Failed to create conversation');
    }
  }
);

// ============ NEW: SEND QUERY/MESSAGE ============
export const sendQueryMessage = createAsyncThunk(
  'chat/sendQueryMessage',
  async ({ conversationId, query }, { rejectWithValue }) => {
    try {
      console.log('[CHAT] Sending query to conversation:', conversationId);
      console.log('[CHAT] Query:', query);
      
      const response = await api.post(`/conversations/${conversationId}/messages`, {
        content: query,
        role: 'user'
      });
      
      console.log('[CHAT] ✅ Query sent successfully:', response.data);
      return {
        conversationId,
        message: response.data.message
      };
    } catch (error) {
      console.error('[CHAT] ❌ Error sending query:', error);
      return rejectWithValue(error.message || 'Failed to send query');
    }
  }
);

// ============ NEW: DELETE CONVERSATION ============
export const deleteConversation = createAsyncThunk(
  'chat/deleteConversation',
  async (conversationId, { rejectWithValue }) => {
    try {
      console.log('[CHAT] Deleting conversation:', conversationId);
      await api.delete(`/conversations/${conversationId}`);
      console.log('[CHAT] ✅ Conversation deleted');
      return conversationId;
    } catch (error) {
      console.error('[CHAT] ❌ Error deleting conversation:', error);
      return rejectWithValue(error.message || 'Failed to delete conversation');
    }
  }
);

// ============ SLICE ============

const initialState = {
  conversations: [],
  currentConversationId: null,
  currentMessages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isLoadingQuery: false,
  error: null,
  streamingContent: '',
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    selectConversation: (state, action) => {
      state.currentConversationId = action.payload;
      console.log('[CHAT] Selected conversation:', action.payload);
    },

    setCurrentMessages: (state, action) => {
      state.currentMessages = action.payload;
    },

    addStreamingContent: (state, action) => {
      state.streamingContent += action.payload;
    },

    resetStreamingContent: (state) => {
      state.streamingContent = '';
    },

    addUserMessage: (state, action) => {
      state.currentMessages.push({
        id: Date.now(),
        role: 'user',
        content: action.payload,
        created_at: new Date().toISOString(),
      });
    },

    addAssistantMessage: (state, action) => {
      state.currentMessages.push({
        id: Date.now(),
        role: 'assistant',
        content: action.payload,
        created_at: new Date().toISOString(),
      });
    },

    clearError: (state) => {
      state.error = null;
    },

    newChat: (state) => {
      state.currentConversationId = null;
      state.currentMessages = [];
      state.streamingContent = '';
    },
  },

  extraReducers: (builder) => {
    // Fetch Conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoadingConversations = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        const { conversationId, messages } = action.payload;
        state.currentConversationId = conversationId;
        state.currentMessages = messages;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoadingConversations = false;
        state.error = action.payload;
      });

    // Fetch Messages
    builder
      .addCase(fetchConversationMessages.pending, (state) => {
        state.isLoadingMessages = true;
        state.error = null;
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.isLoadingConversations = false;
        state.conversations.unshift(action.payload);
        state.currentConversationId = action.payload.id;
        state.currentMessages = [];
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.isLoadingMessages = false;
        state.error = action.payload;
      });

    builder
      .addCase(sendQueryMessage.pending, (state) => {
        state.isLoadingQuery = true;
        state.error = null;
      })
      .addCase(sendQueryMessage.fulfilled, (state, action) => {
        state.isLoadingQuery = false;
        // Message is already added optimistically in ChatPage
        // This just confirms it was saved on backend
        console.log('[CHAT] Query confirmed saved on backend');
      })
      .addCase(sendQueryMessage.rejected, (state, action) => {
        state.isLoadingQuery = false;
        state.error = action.payload;
        // TODO: Remove the optimistically added message if persistence failed
      });

    // Create Conversation
    builder
      .addCase(createNewConversation.pending, (state) => {
        state.isLoadingConversations = true;
        state.error = null;
      })
      .addCase(createNewConversation.fulfilled, (state, action) => {
        state.isLoadingConversations = false;
        state.conversations.unshift(action.payload);
        state.currentConversationId = action.payload.id;
        state.currentMessages = [];
      })
      .addCase(createNewConversation.rejected, (state, action) => {
        state.isLoadingConversations = false;
        state.error = action.payload;
      });

      builder
      .addCase(deleteConversation.pending, (state) => {
        state.isLoadingConversations = true;
        state.error = null;
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.isLoadingConversations = false;
        const deletedId = action.payload;
        state.conversations = state.conversations.filter(
          (conv) => conv.id !== deletedId
        );
        
        // If deleted conversation was selected, clear it
        if (state.currentConversationId === deletedId) {
          state.currentConversationId = null;
          state.currentMessages = [];
          state.streamingContent = '';
        }
      })
      .addCase(deleteConversation.rejected, (state, action) => {
        state.isLoadingConversations = false;
        state.error = action.payload;
      });
  },
});

export const {
  selectConversation,
  setCurrentMessages,
  addStreamingContent,
  resetStreamingContent,
  addUserMessage,
  addAssistantMessage,
  clearError,
  newChat,
} = chatSlice.actions;

export default chatSlice.reducer;
