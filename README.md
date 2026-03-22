# VERITLY AI - Legal Research Assistant (Frontend)

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.0-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Production-ready frontend for an AI-powered legal research platform built with React, Redux, and modern web technologies.

## 🎯 Overview

VERITLY AI is a conversational legal research assistant that helps attorneys quickly find relevant case law, statutes, and legal precedents. This repository contains the **client-side application** that provides a ChatGPT-like interface for interacting with our RAG (Retrieval-Augmented Generation) backend.

**Live Demo:** [https://www.veritlyai.com](https://www.veritlyai.com)

---

## ✨ Key Features

### Core Functionality
- **💬 Real-time Legal Chat** - Conversational interface for case law research with streaming responses
- **📚 Source Citations** - Every answer includes clickable citations to legal documents with page numbers
- **📄 PDF Viewer** - In-app PDF viewer for reading cited cases without leaving the platform
- **🗂️ Conversation Management** - Save, organize, and revisit research sessions
- **🔐 Secure Authentication** - JWT-based auth with automatic token refresh

### User Experience
- **⚡ Streaming Responses** - Real-time answer generation with typing indicators
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile
- **🎨 Modern UI** - Clean, professional interface built with Tailwind CSS and Framer Motion
- **♿ Accessibility** - WCAG-compliant with keyboard navigation and screen reader support

### Technical Features
- **🔄 State Management** - Centralized Redux store with Redux Toolkit
- **🛡️ Protected Routes** - Automatic redirect for unauthenticated users
- **📡 API Abstraction** - Axios interceptors for auth token injection
- **⚠️ Error Handling** - Graceful error states with user-friendly messages
- **💾 Persistent Sessions** - LocalStorage integration for seamless experience

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | React 19 | UI components and rendering |
| **Build Tool** | Vite 6 | Fast builds and HMR |
| **State Management** | Redux Toolkit | Centralized app state |
| **Styling** | Tailwind CSS | Utility-first styling |
| **UI Components** | shadcn/ui, Radix UI | Accessible component primitives |
| **Animations** | Framer Motion | Smooth page transitions |
| **HTTP Client** | Axios | API requests with interceptors |
| **Routing** | React Router v6 | Client-side navigation |

### Project Structure

```
ronaldo/
├── src/
│   ├── api/
│   │   └── axiosInstance.js        # Axios config with auth interceptors
│   ├── components/
│   │   ├── chat/                   # Chat-specific components
│   │   │   ├── ConversationSidebar.jsx
│   │   │   └── SourceCard.jsx
│   │   ├── common/                 # Reusable components
│   │   ├── layout/                 # Headers, footers, modals
│   │   │   ├── Header.jsx
│   │   │   ├── PdfViewerModal.jsx
│   │   │   └── LoadingScreen.jsx
│   │   └── ui/                     # shadcn/ui components
│   ├── pages/
│   │   ├── ChatPage.jsx            # Main chat interface
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   └── PricingPage.jsx
│   ├── store/
│   │   ├── slices/
│   │   │   ├── authSlice.js        # Authentication state
│   │   │   ├── chatSlice.js        # Conversation & message state
│   │   │   └── documentSlice.js    # PDF viewer state
│   │   └── store.js                # Redux store config
│   ├── utils/
│   │   └── streamingHelper.js      # SSE streaming utilities
│   ├── App.jsx                     # Route config & auth guards
│   └── main.jsx                    # App entry point
├── public/
├── index.html
└── vite.config.js
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API running (see [hamilton](https://github.com/pranayrishith16/hamilton) for backend setup)

### Installation

```bash
# Clone the repository
git clone https://github.com/pranayrishith16/ronaldo.git
cd ronaldo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=https://www.veritlyai.com
# or for local development:
# VITE_API_BASE_URL=http://localhost:8000
```

### Development

```bash
# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔐 Authentication Flow

The app uses JWT-based authentication with automatic token refresh:

1. **Login/Signup** → Receive `access_token` + `refresh_token`
2. **Store tokens** in localStorage
3. **Axios interceptor** injects `Authorization: Bearer <token>` on every request
4. **Token expiry detection** → Automatically refresh before expiration
5. **401 handling** → Retry failed request with new token
6. **Logout** → Clear tokens and redirect to login

**Implementation:** See `src/api/axiosInstance.js` and `src/store/slices/authSlice.js`

---

## 💬 Chat Architecture

### Message Flow

```
User Input
    ↓
[Redux Action: addUserMessage]
    ↓
[API Request to /api/query/stream]
    ↓
[SSE Stream Processing]
    ↓
[Redux Action: addAssistantMessage + updateLastMessage]
    ↓
UI Update (React re-render)
```

### Streaming Response Handling

```javascript
// Simplified example from src/utils/streamingHelper.js
const handleStream = async (response) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = JSON.parse(line.slice(6));
        dispatch(updateLastMessage(data.content));
      }
    }
  }
};
```

**Key Features:**
- Real-time text streaming (Server-Sent Events)
- Source citations arrive with first chunk
- Smooth typing animation
- Generation time tracking

---

## 📊 State Management

### Redux Slices

| Slice | Purpose | Key Actions |
|-------|---------|-------------|
| **authSlice** | User authentication | `loginUser`, `signupUser`, `checkAuth`, `refreshAccessToken`, `logout` |
| **chatSlice** | Conversations & messages | `fetchConversations`, `fetchConversationMessages`, `addUserMessage`, `addAssistantMessage` |
| **documentSlice** | PDF viewer state | `fetchDocumentUrl`, `closeViewer` |

### Example: Protected Route

```javascript
// src/App.jsx
function ProtectedRoute({ children }) {
  const { isLoggedIn, isAuthChecked } = useSelector(state => state.auth);

  if (!isAuthChecked) return <LoadingScreen />;
  if (!isLoggedIn) return <Navigate to="/login" />;

  return children;
}
```

---

## 📱 UI Components

### Key Components

**ChatPage** (`src/pages/ChatPage.jsx`)
- Main chat interface
- Message rendering with Markdown support
- Source citation cards
- Conversation sidebar

**SourceCard** (`src/components/chat/SourceCard.jsx`)
- Displays legal source metadata (case name, court, docket number)
- Clickable to open PDF viewer
- Horizontal scrolling for multiple sources

**PdfViewerModal** (`src/components/layout/PdfViewerModal.jsx`)
- Secure PDF viewing with Authorization header
- Fullscreen modal with close button
- Loading states

**ConversationSidebar** (`src/components/chat/ConversationSidebar.jsx`)
- List of past conversations
- Search functionality
- Delete with confirmation

---

## 🎨 Design System

**Colors:**
- Primary: Blue (#3B82F6)
- Background: Dark slate (#0F172A, #1E293B)
- Text: White/Slate (#F8FAFC, #CBD5E1)

**Typography:**
- System fonts for body text
- Monospace for code blocks

**Animations:**
- Framer Motion for page transitions
- Custom gradient animations (roadmap, hero)
- Smooth scrolling for source cards

---

## 🧪 Development Workflow

### Code Quality Tools

```bash
# Format code
npm run format  # (if configured)

# Lint code
npm run lint    # (if configured)

# Type checking
npm run typecheck  # (if TypeScript is added)
```

### Best Practices

- ✅ Use Redux Toolkit for state management
- ✅ Implement proper error boundaries
- ✅ Handle loading states gracefully
- ✅ Add PropTypes or TypeScript for type safety
- ✅ Keep components small and focused
- ✅ Use custom hooks for reusable logic

---

## 🚧 Known Issues & Roadmap

### Current Issues (from TODO.md)
- [ ] Refresh token logic needs debugging (works on retry but clears localStorage initially)
- [ ] Backend deployment update pending

### Planned Features
- [ ] Multi-file document upload
- [ ] Advanced search filters
- [ ] Export conversation to PDF
- [ ] Mobile app (React Native)
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts
- [ ] Citation export (BibTeX, APA)

---

## 📄 API Integration

### Backend Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | User login |
| `/api/auth/signup` | POST | User registration |
| `/api/auth/refresh-token` | POST | Refresh access token |
| `/api/query/stream` | POST | Stream AI response (SSE) |
| `/api/memory/conversations` | GET | Fetch all conversations |
| `/api/memory/conversations/:id/messages` | GET | Fetch conversation messages |
| `/api/documents/view/:path` | GET | Secure PDF streaming |

**Backend Repository:** [hamilton](https://github.com/pranayrishith16/hamilton)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Development Guidelines:**
- Follow existing code style
- Add comments for complex logic
- Test authentication flows thoroughly
- Ensure responsive design

---

## 📧 Contact

**Pranay Rishith Bondugula**
- GitHub: [@pranayrishith16](https://github.com/pranayrishith16)
- Email: pranayrishith@example.com
- Website: [https://www.veritlyai.com](https://www.veritlyai.com)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for accessible component primitives
- [Radix UI](https://www.radix-ui.com/) for unstyled UI components
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

---

**⭐ If you find this project helpful, please give it a star!**
