import React, { useState, useRef, useEffect } from "react";
import { Settings, Plus, Search, Send, Paperclip, Mic } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { nanoid } from "nanoid";
import ReactMarkdown from 'react-markdown';

// Simple Source Card Component using Tailwind/shadcn-style design
const SourceCard = ({ source, index }) => (
  <div className="bg-gray-800/50 hover:bg-gray-800 transition-colors border border-gray-700/50 rounded-lg p-3 text-sm shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <div className="text-purple-400 font-medium text-xs">
        Source {index + 1}
      </div>
      <div className="text-gray-500 text-xs">
        Page {source.page_number}
      </div>
    </div>
    <div className="text-gray-200 text-sm font-medium truncate">
      {source.source.split("/").pop()}
    </div>
    {source.content && (
      <div className="text-gray-400 text-xs mt-1 line-clamp-2">
        {source.content.substring(0, 100)}...
      </div>
    )}
  </div>
);

export default function ChatPage() {
  // Thread list for sidebar
  const [threads, setThreads] = useState([{ id: nanoid(), title: "New Chat" }]);

  // Map of threadId → messages array
  const [messagesByThread, setMessagesByThread] = useState({});

  // Currently active thread
  const [currentThreadId, setCurrentThreadId] = useState(threads[0].id);

  // Input state
  const [message, setMessage] = useState("");

  // Search query (sidebar)
  const [searchQuery, setSearchQuery] = useState("");

  // loading state
  const [loadingLabel, setLoadingLabel] = useState("");
  const loadingTimer = useRef(null);

  // Refs for auto-scrolling
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Convenience
  const currentMessages = messagesByThread[currentThreadId] || [];
  const isSendDisabled = message.trim().length === 0;

  // Auto-scroll to bottom function
  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  // Auto-scroll when messages change or loading state changes
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      scrollToBottom(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentMessages.length, loadingLabel]);

  // Scroll when switching threads
  useEffect(() => {
    scrollToBottom(false);
  }, [currentThreadId]);

  const handleSend = async () => {
    if (isSendDisabled) return;
    const text = message.trim();

    // Rename thread on first message
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === currentThreadId && thread.title === "New Chat"
          ? {
              ...thread,
              title: text.slice(0, 30) + (text.length > 30 ? "…" : ""),
            }
          : thread
      )
    );

    // Append user message
    const userMsg = { id: nanoid(), sender: "user", text };
    setMessagesByThread((prev) => ({
      ...prev,
      [currentThreadId]: [...(prev[currentThreadId] || []), userMsg],
    }));
    setMessage("");

    // Start loading timer with better visibility
    let seconds = 0;
    setLoadingLabel(`Retrieving and generating response... ${seconds}s`);
    loadingTimer.current = setInterval(() => {
      seconds += 1;
      setLoadingLabel(`Retrieving and generating response... ${seconds}s`);
    }, 1000);

    try {
      // Stream response
      const response = await fetch("https://api.veritlyai.com/query/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, threadId: currentThreadId }),
      });

      // If error or no body, stop loading
      if (!response.ok || !response.body) {
        if (loadingTimer.current) clearInterval(loadingTimer.current);
        setLoadingLabel("");
        console.error("Response error:", response.status);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiText = "";
      let firstChunk = true;
      let sources = [];
      let buffer = "";
      let aiMessageId = null;

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

            if (dataStr === "[DONE]") {
              if (loadingTimer.current) clearInterval(loadingTimer.current);
              setLoadingLabel("");
              continue;
            }

            if (dataStr.startsWith(":ping") || dataStr === "") {
              continue;
            }

            try {
              const data = JSON.parse(dataStr);

              // Handle metadata (sources) - typically comes first
              if (data.metadata && Array.isArray(data.metadata)) {
                sources = data.metadata;
                console.log("Received sources:", sources);
              }

              // Handle streaming text content
              if (data.choices && data.choices[0] && data.choices[0].delta) {
                const deltaContent = data.choices[0].delta.content || "";

                if (deltaContent) {
                  aiText += deltaContent;

                  if (firstChunk) {
                    // Stop loading timer on first content
                    if (loadingTimer.current)
                      clearInterval(loadingTimer.current);
                    setLoadingLabel("");

                    // Create AI message with sources and empty text
                    aiMessageId = nanoid();
                    const aiMessage = {
                      id: aiMessageId,
                      sender: "ai",
                      text: deltaContent, // Start with the first chunk
                      sources: sources,
                    };

                    setMessagesByThread((prev) => ({
                      ...prev,
                      [currentThreadId]: [
                        ...(prev[currentThreadId] || []),
                        aiMessage,
                      ],
                    }));
                    firstChunk = false;
                  } else {
                    // Update the AI message text in real-time streaming
                    setMessagesByThread((prev) => {
                      const msgs = [...(prev[currentThreadId] || [])];
                      const lastMsgIndex = msgs.length - 1;
                      if (
                        lastMsgIndex >= 0 &&
                        msgs[lastMsgIndex].id === aiMessageId
                      ) {
                        msgs[lastMsgIndex] = {
                          ...msgs[lastMsgIndex],
                          text: aiText, // Update with accumulated text
                          sources:
                            sources.length > 0
                              ? sources
                              : msgs[lastMsgIndex].sources,
                        };
                      }
                      return { ...prev, [currentThreadId]: msgs };
                    });
                  }
                }
              }

              if (data.error) {
                console.error("Stream error:", data.error);
                if (loadingTimer.current) clearInterval(loadingTimer.current);
                setLoadingLabel("");
                break;
              }
            } catch (parseError) {
              console.warn("Failed to parse SSE data:", dataStr, parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      if (loadingTimer.current) clearInterval(loadingTimer.current);
      setLoadingLabel("");

      const errorMsg = {
        id: nanoid(),
        sender: "ai",
        text: "Sorry, there was an error processing your request. Please try again.",
        sources: [],
      };
      setMessagesByThread((prev) => ({
        ...prev,
        [currentThreadId]: [...(prev[currentThreadId] || []), errorMsg],
      }));
    }
  };

  function handleNewChat() {
    const id = nanoid();
    const title = "New Chat";
    setThreads((prev) => [{ id, title }, ...prev]);
    setCurrentThreadId(id);
    setMessage("");
  }

  function selectThread(id) {
    setCurrentThreadId(id);
    setMessage("");
  }

  const currentThread = threads.find((t) => t.id === currentThreadId) || {};

  return (
    <div className="bg-black h-screen flex overflow-hidden">
      {/* Sidebar - Fixed positioning removed */}
      <aside className="w-80 h-full bg-gray-950 border-r border-gray-800/50 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/30 flex-shrink-0">
          <h3 className="text-white text-lg font-semibold">VERITLY.AI</h3>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <Settings size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 flex-shrink-0">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* New Chat */}
        <div className="px-4 pb-4 flex-shrink-0">
          <button
            onClick={handleNewChat}
            className="flex items-center justify-center space-x-2 w-full p-3 text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Threads */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          {threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => selectThread(thread.id)}
              className={`flex items-center space-x-2 p-2 text-sm rounded-lg cursor-pointer transition-colors ${
                thread.id === currentThreadId
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800/50"
              }`}
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              <span className="truncate">{thread.title}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-900 relative flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-center flex-shrink-0">
          <h2 className="text-neutral-300 text-lg font-medium truncate">
            {currentThread.title}
          </h2>
        </header>

        {/* Messages Container - Global scrollbar that scrolls message content */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#6B7280 #111827",
          }}
        >
          <div className="px-4 py-6">
            <div className="mx-auto w-full max-w-4xl">
              {currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[50vh]">
                  <h1 className="text-5xl font-extrabold text-gray-100">
                    Hi there,
                  </h1>
                  <h2 className="text-2xl font-semibold text-gray-200">
                    How can I help you today?
                  </h2>
                  <p className="text-gray-400 max-w-md">
                    I'm here to assist with drafting content, analyzing data,
                    automating tasks, and more.
                  </p>
                </div>
              ) : (
                <>
                  {currentMessages.map((msg) => (
                    <div key={msg.id} className="mb-8">
                      {/* User Message */}
                      {msg.sender === "user" && (
                        <div className="flex justify-end mb-6">
                          <div className="bg-purple-500 text-white rounded-xl px-4 py-3 max-w-[80%] shadow-lg">
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* AI Message with new structure */}
                      {msg.sender === "ai" && (
                        <div className="space-y-6">
                          {/* Sources Section - appears first */}
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center text-sm font-semibold text-gray-200">
                                <span className="text-lg mr-2">📚</span>
                                Sources
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {msg.sources.slice(0, 6).map((source, idx) => (
                                  <SourceCard
                                    key={idx}
                                    source={source}
                                    index={idx}
                                  />
                                ))}
                              </div>
                              {msg.sources.length > 6 && (
                                <div className="text-gray-500 text-sm">
                                  + {msg.sources.length - 6} more sources
                                </div>
                              )}
                            </div>
                          )}

                          {/* Result Section - appears after sources */}
                          {msg.text && (
                            <div className="space-y-3">
                              <div className="flex items-center text-sm font-semibold text-gray-200">
                                <span className="text-lg mr-2">💡</span>
                                Result
                              </div>
                              <div className="bg-gray-800/30 border-l-4 border-purple-500 rounded-r-lg p-4">
                                <div className="text-gray-100 leading-relaxed prose prose-invert max-w-none">
                                  <ReactMarkdown
                                    components={{
                                      p: ({ children }) => (
                                        <p className="mb-3 last:mb-0">
                                          {children}
                                        </p>
                                      ),
                                      h1: ({ children }) => (
                                        <h1 className="text-xl font-bold mb-3 text-white">
                                          {children}
                                        </h1>
                                      ),
                                      h2: ({ children }) => (
                                        <h2 className="text-lg font-semibold mb-3 text-white">
                                          {children}
                                        </h2>
                                      ),
                                      h3: ({ children }) => (
                                        <h3 className="text-base font-medium mb-2 text-white">
                                          {children}
                                        </h3>
                                      ),
                                      ul: ({ children }) => (
                                        <ul className="list-disc list-inside mb-3 space-y-1 ml-4">
                                          {children}
                                        </ul>
                                      ),
                                      ol: ({ children }) => (
                                        <ol className="list-decimal list-inside mb-3 space-y-1 ml-4">
                                          {children}
                                        </ol>
                                      ),
                                      li: ({ children }) => (
                                        <li className="text-gray-200">
                                          {children}
                                        </li>
                                      ),
                                      code: ({ children, inline }) => {
                                        return inline ? (
                                          <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-purple-300">
                                            {children}
                                          </code>
                                        ) : (
                                          <code>
                                            {children}
                                          </code>
                                        );
                                      },
                                      pre: ({ children }) => (
                                        <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto mb-3 border border-gray-700">
                                          {children}
                                        </pre>
                                      ),
                                      blockquote: ({ children }) => (
                                        <blockquote className="border-l-2 border-gray-600 pl-4 italic mb-3 text-gray-300">
                                          {children}
                                        </blockquote>
                                      ),
                                      strong: ({ children }) => (
                                        <strong className="font-semibold text-white">
                                          {children}
                                        </strong>
                                      ),
                                      em: ({ children }) => (
                                        <em className="italic text-gray-200">
                                          {children}
                                        </em>
                                      ),
                                      a: ({ children, href }) => (
                                        <a
                                          href={href}
                                          className="text-purple-400 hover:text-purple-300 underline"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {children}
                                        </a>
                                      ),
                                      table: ({ children }) => (
                                        <div className="overflow-x-auto mb-3">
                                          <table className="min-w-full border border-gray-700 rounded-lg">
                                            {children}
                                          </table>
                                        </div>
                                      ),
                                      th: ({ children }) => (
                                        <th className="border border-gray-700 px-3 py-2 bg-gray-800 text-left font-semibold text-white">
                                          {children}
                                        </th>
                                      ),
                                      td: ({ children }) => (
                                        <td className="border border-gray-700 px-3 py-2 text-gray-200">
                                          {children}
                                        </td>
                                      ),
                                    }}
                                  >
                                    {msg.text}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading indicator - more visible */}
                  {loadingLabel && (
                    <div className="flex justify-start mb-6">
                      <div className="bg-gray-800 border border-gray-700 text-gray-200 rounded-xl px-4 py-3 text-sm shadow-lg animate-pulse">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <span className="ml-2">{loadingLabel}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-gray-900 border-t border-gray-800/30 p-4 lg:p-6 flex-shrink-0">
          <div className="mx-auto w-full max-w-4xl">
            <div className="bg-gray-800 border border-purple-500/50 rounded-xl shadow-xl">
              <div className="flex items-start px-4 py-3">
                <div className="w-1 rounded-full mr-3 h-6 flex-shrink-0" />
                <TextareaAutosize
                  minRows={1}
                  maxRows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none resize-none text-sm leading-relaxed"
                />
              </div>
              <div className="flex items-center justify-between px-4 pb-3 text-gray-400 text-sm">
                <div className="flex items-center space-x-3">
                  <button
                    className="hover:text-white transition-colors p-1 rounded"
                    aria-label="Voice input"
                  >
                    <Mic size={18} />
                  </button>
                  <button
                    className="hover:text-white transition-colors p-1 rounded"
                    aria-label="Attach file"
                  >
                    <Paperclip size={18} />
                  </button>
                  <span className="text-gray-400">Add content</span>
                </div>
                <button
                  disabled={isSendDisabled}
                  onClick={handleSend}
                  className={`flex items-center justify-center h-9 w-9 rounded-lg transition-all ${
                    isSendDisabled
                      ? "bg-gray-600 cursor-not-allowed text-gray-500"
                      : "bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-purple-500/25"
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                This text is generated using AI and may contain mistakes.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #111827;
          border-radius: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}