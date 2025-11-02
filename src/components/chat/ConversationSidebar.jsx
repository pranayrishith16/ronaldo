import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConversations,
  fetchConversationMessages,
  deleteConversation,
  newChat,
} from "../../store/slices/chatSlice";

export default function ConversationSidebar() {
  const dispatch = useDispatch();
  const conversations = useSelector((state) => state.chat.conversations);
  const currentConversationId = useSelector(
    (state) => state.chat.currentConversationId
  );
  const isLoadingConversations = useSelector(
    (state) => state.chat.isLoadingConversations
  );

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleSelectConversation = (conversationId) => {
    console.log("[SIDEBAR] Selected conversation:", conversationId);
    dispatch(fetchConversationMessages(conversationId));
  };

  const handleNewChat = () => {
    console.log("[SIDEBAR] New chat clicked");
    dispatch(newChat());
  };

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    if (deleteConfirm === conversationId) {
      // Confirm delete
      await dispatch(deleteConversation(conversationId));
      setDeleteConfirm(null);
    } else {
      // First click - ask for confirmation
      setDeleteConfirm(conversationId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="w-72 h-screen bg-gradient-to-b from-purple-600 to-purple-700 flex flex-col shadow-lg">
      {/* Header */}
      <div className="px-6 py-6 border-b border-purple-500 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Conversations</h2>
        <button
          onClick={handleNewChat}
          className="w-9 h-9 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white flex items-center justify-center text-lg transition-all duration-200 hover:scale-105"
          title="Start new conversation"
        >
          +
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingConversations ? (
          <div className="px-6 py-8 text-center text-purple-100 text-sm">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-6 py-8 text-center text-purple-100 text-sm">
            No conversations yet
          </div>
        ) : (
          <ul className="space-y-2 px-4 py-4">
            {conversations.map((conv) => (
              <li
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group relative ${
                  currentConversationId === conv.id
                    ? "bg-white bg-opacity-25 border border-white border-opacity-50 shadow-md"
                    : "bg-white bg-opacity-10 border border-white border-opacity-20 hover:bg-opacity-15 hover:translate-x-1"
                }`}
              >
                <div className="text-white font-medium text-sm truncate pr-6">
                  {conv.title || "Untitled"}
                </div>
                <div className="text-purple-100 text-xs mt-1 opacity-80">
                  {new Date(conv.created_at).toLocaleDateString()}
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                    deleteConfirm === conv.id
                      ? "bg-red-500 text-white"
                      : "bg-white bg-opacity-0 group-hover:bg-opacity-20 text-white opacity-0 group-hover:opacity-100"
                  }`}
                  title={
                    deleteConfirm === conv.id
                      ? "Click again to confirm"
                      : "Delete conversation"
                  }
                >
                  {deleteConfirm === conv.id ? "!" : "×"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
