import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Settings, Plus, Search, Send, Menu, X, Trash2 } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { nanoid } from "nanoid";
import ReactMarkdown from "react-markdown";
import api from "../api/axiosInstance";
import { store } from "../store/store";
import { getValidToken } from "../utils/streamingHelper";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import {
  fetchConversations,
  fetchConversationMessages,
  createNewConversation,
  deleteConversation,
  selectConversation,
  newChat,
} from "../store/slices/chatSlice";


// Memoized Source Card Component
const SourceCard = React.memo(({ source, index }) => {
  if (!source) return null;

  const sourceName = 
    typeof source.source === 'string'
    ? source.source.split("/").pop() 
    : source.source_name || "Unknown Source";

  return (
  <div className="group bg-slate-800/40 hover:bg-slate-800/60 transition-all duration-200 border border-slate-700/50 hover:border-slate-600/50 rounded-lg p-3 text-sm shadow-sm hover:shadow-md">
    <div className="flex items-center justify-between mb-2">
      <span className="text-blue-400 font-medium text-xs tracking-wide">
        SOURCE {index + 1}
      </span>
      <span className="text-slate-500 text-xs">Page ${source.page_number}</span>
    </div>
    <div className="text-slate-200 text-sm font-medium truncate mb-1">
      {source.source.split("/").pop()}
    </div>
    {source.content && (
      <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
        {source.content.substring(0, 100)}...
      </p>
    )}
  </div>
  )});

SourceCard.displayName = "SourceCard";

export default function ChatPage() {
  useEffect(() => {
    document.title = "Veritly AI - Legal Research Assistant";
  }, []);

  // Hooks setup
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // REDUX
  const {
    conversations: reduxConversations,
    currentConversationId: reduxCurrentConvId,
    currentMessages: reduxCurrentMessages,
    isLoadingConversations: reduxIsLoading,
    error: reduxError,
  } = useSelector((state) => state.chat);

  // Local State
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingLabel, setLoadingLabel] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState(null);
  const [generationTimes, setGenerationTimes] = useState({});

  // Ref
  const loadingTimer = useRef(null);
  const streamStartTime = useRef(null);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Derived states from Redux
  const currentConversation = reduxConversations.find(
    (conv) => conv.id === reduxCurrentConvId
  );
  const currentMessages = reduxCurrentMessages;
  const isSendDisabled = message.trim().length === 0;
  const isLoadingConversations = reduxIsLoading;

  // Scroll helper
  const scrollToBottom = useCallback((smooth = true) => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // loading timer mounting
  useEffect(() => {
    return () => {
      if (loadingTimer.current) clearInterval(loadingTimer.current);
    };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom(true), 100);
    return () => clearTimeout(timer);
  }, [currentMessages.length, loadingLabel, scrollToBottom]);

  // scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom(false);
  }, [reduxCurrentConvId, scrollToBottom]);

  // auto clear errors
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // FETCH CONVERSATIONS ON MOUNT
  useEffect(() => {
    console.log("[CHAT] Dispatching fetchConversations...");
    dispatch(fetchConversations());
  }, [dispatch]);

  // FETCH messages when conversation changes
  useEffect(() => {
    if (reduxCurrentConvId) {
      console.log(
        "[CHAT] Fetching messages for conversation:",
        reduxCurrentConvId
      );
      dispatch(fetchConversationMessages(reduxCurrentConvId));
    }
  }, [reduxCurrentConvId, dispatch]);

  // Filtered conversations for search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return reduxConversations;
    return reduxConversations.filter((conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reduxConversations, searchQuery]);

  // create conversation when new conversation
  const ensureConversation = useCallback(
    async (firstMessageText) => {
      // If conversation already exists, return it
      if (reduxCurrentConvId) {
        console.log("[CHAT] Using existing conversation:", reduxCurrentConvId);
        return reduxCurrentConvId;
      }

      // Create new conversation
      try {
        console.log("[CHAT] Creating new conversation...");
        const title =
          firstMessageText.substring(0, 50) +
          (firstMessageText.length > 50 ? "..." : "");

        const result = await dispatch(
          createNewConversation({ title })
        ).unwrap();
        console.log("[CHAT] ✅ Conversation created:", result.id);

        return result.id;
      } catch (error) {
        console.error("[CHAT] Failed to create conversation:", error);
        throw new Error("Failed to create conversation. Please try again.");
      }
    },
    [reduxCurrentConvId, dispatch]
  );

  // ============ SEND MESSAGE WITH CONVERSATION_ID ============
  const handleSend = async () => {
    if (isSendDisabled) return;
    const text = message.trim();
    setError(null);

    // Add user message to UI immediately
    const userMsg = {
      id: nanoid(),
      role: "user",
      content: text,
      sources: [],
      created_at: new Date().toISOString(),
    };

    // ============== LOADING TIMER ==============
    let seconds = 0;
    setLoadingLabel(`Analyzing... ${seconds}s`);
    loadingTimer.current = setInterval(() => {
      seconds += 1;
      setLoadingLabel(`Analyzing... ${seconds}s`);
    }, 1000);

    streamStartTime.current = Date.now();
    setMessage("");

    try {
      // ============ ENSURE CONVERSATION EXISTS ============
      let conversationId = reduxCurrentConvId;
      if (!conversationId) {
        conversationId = await ensureConversation(text);
      }
      console.log("[CHAT] Using conversation_id:", conversationId);

      // ============ PERSIST USER MESSAGE TO BACKEND ============
      try {
        console.log("[CHAT] Persisting user message to backend...");

        await api.post(`/api/memory/conversations/${conversationId}/messages`, {
          content: text,
          role: "user",
        });
        console.log("[CHAT] ✅ User message saved to backend");
      } catch (persistError) {
        console.error("[CHAT] Failed to persist message:", persistError);
        // Continue with streaming even if persistence fails
      }

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 60000);

      // ============== GET VALID TOKEN ==============
      let token;
      try {
        token = await getValidToken();
        console.log("[CHAT] ✅ Valid token obtained");
      } catch (tokenError) {
        console.error("[CHAT] Failed to get valid token:", tokenError);
        throw new Error("Authentication failed. Please login again.");
      }

      // ============== MAKE STREAMING REQUEST ============
      const response = await fetch("https://api.veritlyai.com/query/stream", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: text,
          conversation_id: conversationId,
          stream: true,
        }),
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      // ============== HANDLE 401 ERRORS WITH RETRY ==============
      if (response.status === 401) {
        console.log(
          "[CHAT] Received 401, attempting token refresh and retry..."
        );

        try {
          const newToken = await getValidToken();
          console.log("[CHAT] ✅ Token refreshed, retrying request");

          const retryResponse = await fetch(
            "https://api.veritlyai.com/query/stream",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${newToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                query: text,
                conversation_id: conversationId,
                stream: true,
              }),
              signal: abortController.signal,
            }
          );

          if (!retryResponse.ok) {
            throw new Error(
              `Retry failed with status: ${retryResponse.status}`
            );
          }

          await handleStream(retryResponse, conversationId);
          return;
        } catch (refreshError) {
          console.error("[CHAT] Token refresh failed:", refreshError);
          dispatch(logout());
          navigate("/login");
          throw new Error("Session expired. Please login again.");
        }
      }

      // ============== CHECK RESPONSE STATUS ==============
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      // ============== START STREAMING ==============
      await handleStream(response, conversationId);
    } catch (error) {
      console.error("[CHAT] Error:", error);

      if (loadingTimer.current) {
        clearInterval(loadingTimer.current);
        loadingTimer.current = null;
      }
      setLoadingLabel("");

      // ============== ERROR HANDLING ==============
      let errorMessage = "Sorry, there was an error processing your request.";

      if (
        error.name === "AbortError" ||
        error.message === "The user aborted a request."
      ) {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (
        error.message.includes("Session expired") ||
        error.message.includes("Please login again")
      ) {
        return;
      }

      setError(errorMessage);
    }
  };

  // ============ HANDLE STREAMING RESPONSE ============
  const handleStream = async (response, conversationId) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiText = "";
    let firstChunk = true;
    let sources = [];
    let buffer = "";
    let aiMessageId = null;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();

            // ============== CHECK FOR DONE MARKER ==============
            if (dataStr === "[DONE]") {
              if (loadingTimer.current) {
                clearInterval(loadingTimer.current);
                loadingTimer.current = null;
              }
              setLoadingLabel("");

              if (aiMessageId && streamStartTime.current) {
                const endTime = Date.now();
                const duration = Math.round(
                  (endTime - streamStartTime.current) / 1000
                );
                setGenerationTimes((prev) => ({
                  ...prev,
                  [aiMessageId]: duration,
                }));
              }
              continue;
            }

            // Skip ping messages
            if (dataStr.startsWith(":ping") || dataStr === "") continue;

            try {
              const data = JSON.parse(dataStr);

              // ============== HANDLE METADATA (SOURCES) ==============
              if (data.metadata && Array.isArray(data.metadata)) {
                sources = data.metadata;
              }

              // ============== HANDLE STREAMED CONTENT ==============
              if (data.choices?.[0]?.delta) {
                const deltaContent = data.choices[0].delta.content || "";

                if (deltaContent) {
                  aiText += deltaContent;

                  // First chunk: display immediately (handled by Redux)
                  if (firstChunk) {
                    if (loadingTimer.current) {
                      clearInterval(loadingTimer.current);
                      loadingTimer.current = null;
                    }
                    setLoadingLabel("");
                    aiMessageId = nanoid();
                    firstChunk = false;

                    // Let Redux handle message updates after streaming completes
                  } else {
                    // Update in-progress message UI
                    // Can add state update here if needed for real-time updates
                  }
                }
              }

              // ============== HANDLE ERRORS FROM BACKEND ==============
              if (data.error) throw new Error(data.error);
            } catch (parseError) {
              console.warn("Failed to parse SSE data:", dataStr, parseError);
            }
          }
        }
      }

      console.log("[CHAT] ✅ Stream completed. Full response:", aiText);

      // ============ PERSIST STREAMED RESPONSE TO BACKEND ============
      try {
        const api = (await import("../api/axiosInstance")).default;
        await api.post(`/api/memory/conversations/${conversationId}/messages`, {
          content: aiText,
          role: "assistant",
          sources: sources,
        });
        console.log("[CHAT] ✅ Assistant message saved to backend");

        // Fetch updated messages from backend to sync Redux
        dispatch(fetchConversationMessages(conversationId));
      } catch (persistError) {
        console.error("[CHAT] Failed to persist response:", persistError);
      }
    } catch (error) {
      console.error("[CHAT] Stream reading error:", error);
      throw error;
    }
  };

  // ============ CREATE NEW CHAT ============
  const handleNewChat = useCallback(() => {
    // Reset Redux state for new conversation
    // This will clear currentConversationId and trigger new conversation creation on first message
    console.log("[CHAT] Starting new chat");
    // Dispatch action to clear current conversation
    // You may need to add a "newChat" action to chatSlice
  }, [dispatch]);

  // ============ SELECT CONVERSATION ============
  const selectConversation = useCallback(
    (conversationId) => {
      console.log("[CHAT] Selecting conversation:", conversationId);
      // Dispatch action to set current conversation
      // You may need to add a "selectConversation" action to chatSlice
    },
    [dispatch]
  );

  // ============ SELECT CONVERSATION ============
  const handleSelectConversation = useCallback(
    (conversationId) => {
      console.log("[CHAT] Selecting conversation:", conversationId);
      // ✅ FIXED: Actually dispatch the selectConversation action
      dispatch(selectConversation(conversationId));
    },
    [dispatch]
  );

  // ============ DELETE CONVERSATION ============
  const handleDeleteConversation = useCallback(
    (conversationId, e) => {
      e?.stopPropagation?.();
      console.log("[CHAT] Deleting conversation:", conversationId);
      dispatch(deleteConversation(conversationId));
    },
    [dispatch]
  );

  return (
    <div className="bg-slate-950 h-screen flex overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800/50 px-4 py-3 flex items-center justify-between z-30">
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle Menu"
        >
          {drawerOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h2 className="text-slate-200 text-sm font-medium truncate px-2 max-w-[60%]">
          {currentConversation?.title || "New Chat"}
        </h2>
        <button
          className="p-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 lg:z-0 w-72 lg:w-80 h-full bg-slate-900 border-r border-slate-800/50 flex flex-col transition-transform duration-300`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
          <h3 className="text-white text-lg font-semibold tracking-tight">
            VERITLY AI
          </h3>
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Settings size={16} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={handleNewChat}
            className="flex items-center justify-center space-x-2 w-full py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all text-sm font-medium shadow-sm"
          >
            <Plus size={16} />
            <span>New Conversation</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {isLoadingConversations ? (
            <div className="text-center text-slate-500 text-sm py-8">
              No conversations found
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-8">
              No conversations found
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(thread.id)}
                className={`group flex items-center space-x-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-all ${
                  conv.id === reduxCurrentConvId
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                <span className="truncate flex-1">{conv.title}</span>
                {reduxConversations.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteConversation(thread.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded transition-all"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-950 flex flex-col min-w-0">
        <header className="hidden lg:flex h-14 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800/50 px-6 items-center justify-center">
          <h2 className="text-slate-200 text-sm font-medium truncate">
            {currentConversation?.title || "New Chat"}
          </h2>
        </header>

        {error && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-3 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto pt-14 lg:pt-0 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
        >
          <div className="px-4 py-6 max-w-4xl mx-auto w-full">
            {currentMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[60vh]">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
                  <svg
                    className="w-8 h-8 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">
                  Legal Research Assistant
                </h1>
                <p className="text-base text-slate-400 max-w-md">
                  Ask me about case law, statutes, legal precedents, or upload
                  documents for analysis.
                </p>
              </div>
            ) : (
              <>
                {currentMessages.map((msg) => (
                  <div key={msg.id} className="mb-8">
                    {msg.role === "user" && (
                      <div className="flex justify-end mb-6">
                        <div className="bg-blue-600 text-white rounded-2xl px-4 py-3 max-w-[85%] shadow-lg">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    )}

                    {msg.role === "assistant" && (
                      <div className="space-y-6">
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center text-sm font-semibold text-slate-300">
                              <div className="w-5 h-5 rounded-lg bg-blue-500/20 flex items-center justify-center mr-2.5">
                                <svg
                                  className="w-3 h-3 text-blue-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <span>Legal Sources</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {msg.sources.map((source, idx) => (
                                <SourceCard
                                  key={idx}
                                  source={source}
                                  index={idx}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {msg.content && (
                          <div className="space-y-3">
                            <div className="flex items-center text-sm font-semibold text-slate-300">
                              <div className="w-5 h-5 rounded-lg bg-blue-500/20 flex items-center justify-center mr-2.5">
                                <svg
                                  className="w-3 h-3 text-blue-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                  />
                                </svg>
                              </div>
                              <span>Analysis</span>
                              {generationTimes[reduxCurrentConvId] !==
                                undefined && (
                                <span className="ml-3 text-xs text-slate-400 font-normal">
                                  (generated in{" "}
                                  {generationTimes[reduxCurrentConvId]}s)
                                </span>
                              )}
                            </div>
                            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-3">
                              <ReactMarkdown
                                components={{
                                  h1: ({ children }) => (
                                    <h1 className="text-2xl font-bold text-white mt-6 mb-4 first:mt-0">
                                      {children}
                                    </h1>
                                  ),
                                  h2: ({ children }) => (
                                    <h2 className="text-xl font-bold text-slate-100 mt-5 mb-3 first:mt-0">
                                      {children}
                                    </h2>
                                  ),
                                  h3: ({ children }) => (
                                    <h3 className="text-lg font-semibold text-slate-200 mt-4 mb-2 first:mt-0">
                                      {children}
                                    </h3>
                                  ),
                                  p: ({ children }) => (
                                    <p className="mb-4 text-sm sm:text-base text-slate-300 leading-relaxed">
                                      {children}
                                    </p>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-300 text-sm sm:text-base">
                                      {children}
                                    </ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="list-decimal pl-6 mb-4 space-y-2 text-slate-300 text-sm sm:text-base">
                                      {children}
                                    </ol>
                                  ),
                                  li: ({ children }) => (
                                    <li className="leading-relaxed">
                                      {children}
                                    </li>
                                  ),
                                  blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-slate-600 bg-slate-700/30 pl-4 pr-3 py-2 my-4 rounded-r italic text-slate-300">
                                      {children}
                                    </blockquote>
                                  ),
                                  code: ({ children, inline }) =>
                                    inline ? (
                                      <code className="bg-slate-700 rounded px-2 py-1 text-blue-300 font-mono text-xs sm:text-sm">
                                        {children}
                                      </code>
                                    ) : (
                                      <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto my-4 border border-slate-700">
                                        <code className="text-blue-300 font-mono text-xs sm:text-sm">
                                          {children}
                                        </code>
                                      </pre>
                                    ),
                                  strong: ({ children }) => (
                                    <strong className="font-bold text-white">
                                      {children}
                                    </strong>
                                  ),
                                  em: ({ children }) => (
                                    <em className="italic text-slate-200">
                                      {children}
                                    </em>
                                  ),
                                  a: ({ children, href }) => (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 underline hover:text-blue-300 transition text-sm sm:text-base"
                                    >
                                      {children}
                                    </a>
                                  ),
                                  table: ({ children }) => (
                                    <div className="overflow-x-auto my-4 rounded-lg border border-slate-700">
                                      <table className="min-w-full text-xs sm:text-sm">
                                        {children}
                                      </table>
                                    </div>
                                  ),
                                  thead: ({ children }) => (
                                    <thead className="bg-slate-700/50">
                                      {children}
                                    </thead>
                                  ),
                                  tbody: ({ children }) => (
                                    <tbody className="divide-y divide-slate-700">
                                      {children}
                                    </tbody>
                                  ),
                                  tr: ({ children }) => (
                                    <tr className="hover:bg-slate-700/30">
                                      {children}
                                    </tr>
                                  ),
                                  th: ({ children }) => (
                                    <th className="px-4 py-2 font-semibold text-left text-slate-100">
                                      {children}
                                    </th>
                                  ),
                                  td: ({ children }) => (
                                    <td className="px-4 py-2 text-slate-300">
                                      {children}
                                    </td>
                                  ),
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {loadingLabel && (
                  <div className="flex justify-start mb-6">
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl px-4 py-3 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                        <span className="text-sm text-slate-300">
                          {loadingLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-slate-800/50 p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden focus-within:border-blue-500/50 transition-colors">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <TextareaAutosize
                  minRows={1}
                  maxRows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about a legal case or statute..."
                  className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:outline-none resize-none text-sm leading-relaxed"
                />
                <button
                  disabled={isSendDisabled}
                  onClick={handleSend}
                  className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all flex-shrink-0 ${
                    isSendDisabled
                      ? "bg-slate-700 cursor-not-allowed text-slate-600"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/50"
                  }`}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2.5">
              Press{" "}
              <kbd className="bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-300 font-mono text-xs">
                Enter
              </kbd>{" "}
              to send •{" "}
              <kbd className="bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-300 font-mono text-xs">
                Shift+Enter
              </kbd>{" "}
              for new line
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}