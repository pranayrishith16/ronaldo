// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import ChatPage from "./pages/ChatPage";
import Placeholder from './pages/Placeholder'
import TeamPage from "./pages/TeamPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/products" element={<Placeholder />} />
            <Route path="/customers" element={<Placeholder />} />
            <Route path="/security" element={<Placeholder />} />
            <Route path="/news" element={<Placeholder />} />
            <Route path="/about" element={<Placeholder />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/login" element={<Placeholder />} />
            <Route path="/demo" element={<Placeholder />} />
            <Route path="/consultation" element={<Placeholder />} />
            <Route path="/platform" element={<Placeholder />} />
            <Route path="/privacy" element={<Placeholder />} />
            <Route path="/terms" element={<Placeholder />} />
            <Route path="/cookies" element={<Placeholder />} />
            <Route path="*" element={<Placeholder />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
