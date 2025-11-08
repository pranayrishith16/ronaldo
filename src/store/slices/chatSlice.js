import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../api/axiosInstance';

// ============ ASYNC THUNKS ============

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[CHAT] Fetching conversations...');
      const response = await api.get('api/memory/conversations');
      console.log('[CHAT] ✅ Conversations fetched:', response.data);
      return response.data || [];
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
      const response = await api.get(`api/memory/conversations/${conversationId}/messages`);
      console.log('[CHAT] ✅ Messages fetched:', response.data);
      return {
        conversationId,
        messages: response.data || [],
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
      const response = await api.post('/api/memory/conversations', { title });
      console.log('[CHAT] ✅ Conversation created:', response.data);
      return response.data;
    } catch (error) {
      console.error('[CHAT] ❌ Error creating conversation:', error);
      return rejectWithValue(error.message || 'Failed to create conversation');
    }
  }
);

// ============ NEW: DELETE CONVERSATION ============
export const deleteConversation = createAsyncThunk(
  'chat/deleteConversation',
  async (conversationId, { rejectWithValue }) => {
    try {
      console.log('[CHAT] Deleting conversation:', conversationId);
      await api.delete(`/api/memory/conversations/${conversationId}`);
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
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    selectConversation: (state, action) => {
      state.currentConversationId = action.payload;
      console.log('[CHAT] Selected conversation:', action.payload);
    },

    // Sync reducer to start a new chat
    newChat: (state) => {
      state.currentConversationId = null;
      state.currentMessages = [];
      console.log("[CHAT] Started new chat");
    },

    setCurrentMessages: (state, action) => {
      state.currentMessages = action.payload;
    },

    addUserMessage: (state, action) => {state.currentMessages.push(action.payload)},

    addAssistantMessage: (state, action) => {
      state.currentMessages.push(action.payload);
    },

    updateAssistantMessageSources: (state, action) => {
      // Handle both direct array and object with messageId
      const sources = Array.isArray(action.payload) 
        ? action.payload 
        : action.payload.sources;
      
      if (action.payload.messageId) {
        // Find specific message by ID
        const msg = state.currentMessages.find(m => m.id === action.payload.messageId);
        if (msg) {
          msg.sources = sources;
        }
      } else {
        // Update last assistant message (fallback)
        if (state.currentMessages.length > 0) {
          const lastMsg = state.currentMessages[state.currentMessages.length - 1];
          if (lastMsg.role === 'assistant') {
            lastMsg.sources = sources;
          }
        }
      }
    },        
    

    updateLastMessage: (state, action) => {
      if (state.currentMessages.length > 0) {
        const lastMsg = state.currentMessages[state.currentMessages.length - 1];
        if (lastMsg.role === 'assistant') {
          lastMsg.content = action.payload;
        }
      }
    },

    clearError: (state) => {
      state.error = null;
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
        state.isLoadingConversations = false;
        state.conversations = action.payload;
        console.log('[CHAT] Conversations set:', action.payload.length, 'conversations');
          // Auto-select first conversation if available and none selected
          if (action.payload.length > 0 && !state.currentConversationId) {
            state.currentConversationId = action.payload[0].id;
      }})
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoadingConversations = false;
        state.error = action.payload;
        console.error('[CHAT] Failed to load conversations:', action.payload);
      });

    // Fetch Messages
    builder
      .addCase(fetchConversationMessages.pending, (state) => {
        state.isLoadingMessages = true;
        state.error = null;
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        // ✅ FIXED: Properly destructure and set current messages
        const { conversationId, messages } = action.payload;
        state.currentConversationId = conversationId;
        state.currentMessages = messages;
        console.log('[CHAT] Messages loaded:', messages.length, 'messages');
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.isLoadingMessages = false;
        state.error = action.payload;
        state.currentMessages = [];
      });

    // Create Conversation
    builder
      .addCase(createNewConversation.pending, (state) => {
        state.isLoadingConversations = true;
        state.error = null;
      })
      .addCase(createNewConversation.fulfilled, (state, action) => {
        state.isLoadingConversations = false;
        // ✅ FIXED: Add new conversation to the list
        state.conversations.unshift(action.payload);
        state.currentConversationId = action.payload.id;
        state.currentMessages = [];
        console.log('[CHAT] New conversation created');
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
        // ✅ FIXED: Remove deleted conversation from list
        state.conversations = state.conversations.filter(
          (conv) => conv.id !== deletedId
        );
        
        if (state.currentConversationId === deletedId) {
          if (state.conversations.length > 0) {
            state.currentConversationId = state.conversations[0].id;
          } else {
            state.currentConversationId = null;
          }
          state.currentMessages = [];
        }
        console.log('[CHAT] Conversation deleted');
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
  updateLastMessage,
  addAssistantMessage,
  clearError,
  newChat,
  updateAssistantMessageSources
} = chatSlice.actions;

export default chatSlice.reducer;
