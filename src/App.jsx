// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./store/slices/authSlice";

import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import Placeholder from "./pages/Placeholder";
import TeamPage from "./pages/TeamPage";
import PricingPage from "./pages/PricingPage";
import ContactUs from "./pages/ContactUs";
import RoadmapPage from "./pages/Roadmap";
import SignupPage from "./pages/SignupPage";
import LoadingScreen from "./components/layout/LoadingScreen";

function ProtectedRoute({ children }) {
  const { isLoggedIn, isAuthChecked } = useSelector((state) => state.auth);

  if (!isAuthChecked) {
    return <LoadingScreen onComplete={() => {}} />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


export default function App() {
  const dispatch = useDispatch();
  const { isLoggedIn, isAuthChecked } = useSelector((state) => state.auth);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    console.log("[APP] App mounted, checking auth...");
    dispatch(checkAuth());
  }, [dispatch]);

  const handleLoadingComplete = () => {
    console.log("[APP] Loading animation complete");
    setShowLoading(false);
  };

  if (showLoading || !isAuthChecked) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <Routes>
            {/* Public Routes - redirect to /chat if already logged in */}
            <Route
              path="/"
              element={
                isLoggedIn ? <Navigate to="/chat" replace /> : <HomePage />
              }
            />
            <Route
              path="/login"
              element={
                isLoggedIn ? <Navigate to="/chat" replace /> : <LoginPage />
              }
            />
            <Route
              path="/signup"
              element={
                isLoggedIn ? <Navigate to="/chat" replace /> : <SignupPage />
              }
            />

            {/* Protected Routes */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />

            {/* Other Public Routes */}
            <Route path="/products" element={<Placeholder />} />
            <Route path="/customers" element={<Placeholder />} />
            <Route path="/security" element={<Placeholder />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/news" element={<Placeholder />} />
            <Route path="/about" element={<Placeholder />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/demo" element={<ContactUs />} />
            <Route path="/consultation" element={<ContactUs />} />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
