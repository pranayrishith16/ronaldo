import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConversationMessages,
  createNewConversation,
  addUserMessage,
  addAssistantMessage,
  addStreamingContent,
  resetStreamingContent,
  newChat,
  sendQueryMessage,
} from "../store/slices/chatSlice";
import ConversationSidebar from "../components/chat/ConversationSidebar";
import { createStreamingRequest } from "../utils/streamingHelper";
import api from "../api/axiosInstance";

// ============ MEMOIZED SOURCE CARD COMPONENT ============
const SourceCard = React.memo(({ source, index }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3">
      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
        Source {index + 1}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {source.content?.substring(0, 100)}...
      </p>
    </div>
  );
});

// ============ CHAT PAGE COMPONENT ============
export default function ChatPage() {
  const dispatch = useDispatch();
  const currentConversationId = useSelector(
    (state) => state.chat.currentConversationId
  );
  const currentMessages = useSelector((state) => state.chat.currentMessages);
  const streamingContent = useSelector((state) => state.chat.streamingContent);
  const isLoadingMessages = useSelector(
    (state) => state.chat.isLoadingMessages
  );
  const isLoadingQuery = useSelector((state) => state.chat.isLoadingQuery);

  const [userInput, setUserInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, streamingContent]);

  // ============ CRITICAL: HANDLE QUERY SUBMISSION ============
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInput.trim()) {
      console.warn("[CHAT] Empty input, skipping submission");
      return;
    }

    try {
      let conversationId = currentConversationId;

      // ISSUE FIX #9: Create conversation if this is the first message
      if (!conversationId) {
        console.log("[CHAT] No conversation exists, creating new one...");

        // Create conversation with auto-generated title from first query
        const title =
          userInput.substring(0, 50) + (userInput.length > 50 ? "..." : "");
        const result = await dispatch(
          createNewConversation({ title })
        ).unwrap();

        conversationId = result.id;
        console.log("[CHAT] ✅ New conversation created:", conversationId);
      }

      // Add user message to Redux state immediately (optimistic update)
      dispatch(addUserMessage(userInput));

      // ISSUE FIX #1: Send conversation_id in the query request
      console.log("[CHAT] Sending query with conversation_id:", conversationId);
      console.log("[CHAT] Query:", userInput);

      // Step 1: Persist user message to backend
      await dispatch(
        sendQueryMessage({
          conversationId,
          query: userInput,
        })
      ).unwrap();

      console.log("[CHAT] ✅ User message saved to backend");

      // Step 2: Start streaming the AI response
      setIsStreaming(true);
      abortControllerRef.current = new AbortController();

      dispatch(resetStreamingContent());

      // ISSUE FIX #4: Include conversation_id in streaming request
      await createStreamingRequest(
        `${process.env.REACT_APP_API_URL}/query`,
        {
          method: "POST",
          body: JSON.stringify({
            query: userInput,
            conversation_id: conversationId, // CRITICAL: Include conversation ID
          }),
          signal: abortControllerRef.current.signal,
        },
        conversationId, // Pass as parameter for logging
        (data) => {
          // Handle streamed content
          if (data.content) {
            dispatch(addStreamingContent(data.content));
          }
        },
        (error) => {
          console.error("[CHAT] Streaming error:", error);
          setIsStreaming(false);
          // TODO: Show error message to user
        },
        () => {
          // Stream completed
          console.log("[CHAT] ✅ Streaming completed");

          // ISSUE FIX #8: Persist streamed content as proper assistant message
          if (streamingContent) {
            dispatch(addAssistantMessage(streamingContent));
          }

          setIsStreaming(false);
          dispatch(resetStreamingContent());
        }
      );

      // Clear input
      setUserInput("");
    } catch (error) {
      console.error("[CHAT] ❌ Error in handleSubmit:", error);

      // ISSUE FIX #7: Proper error handling
      if (error.message === "Aborted") {
        console.log("[CHAT] Request was cancelled");
      } else {
        // Show error to user
        alert(`Error: ${error.message || "Failed to send message"}`);
      }

      setIsStreaming(false);
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      console.log("[CHAT] Streaming stopped by user");
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <ConversationSidebar />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentConversationId ? "Chat" : "Start a new conversation"}
          </h1>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {currentMessages.length === 0 && !streamingContent && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Ask me about case law, statutes, or legal precedents. Your
                  conversations will be saved and accessible anytime.
                </p>
              </div>
            </div>
          )}

          {currentMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
                }`}
              >
                <p className="text-sm md:text-base">{message.content}</p>

                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-gray-300 pt-3">
                    {message.sources.map((source, idx) => (
                      <SourceCard key={idx} source={source} index={idx} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Streaming Content Display */}
          {streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none">
                <p className="text-sm md:text-base">
                  {streamingContent}
                  <span className="animate-pulse">▌</span>
                </p>
              </div>
            </div>
          )}

          {isLoadingMessages && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your question..."
              disabled={isStreaming || isLoadingQuery}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {isStreaming ? (
              <button
                type="button"
                onClick={handleStopStreaming}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!userInput.trim() || isLoadingQuery}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingQuery ? "Sending..." : "Send"}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
