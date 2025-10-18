// src/pages/PlaceholderPage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function PlaceholderPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white overflow-hidden relative">
      {/* Animated gradient background matching your site */}
      <div className="absolute inset-0 -z-10 animate-gradient-slow" />

      {/* Glow effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

      {/* Content */}
      <div className="text-center px-6">
        {/* Ghost-like illustration placeholder */}
        <div className="mb-8 flex justify-center">
          <div className="relative h-64 w-48">
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-white/10 to-transparent blur-2xl animate-pulse" />

            {/* Ghost body */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 h-40 w-32 rounded-t-full bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-sm" />

            {/* Face */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6">
              <div className="flex gap-4">
                <div className="h-3 w-3 rounded-full bg-white/40" />
                <div className="h-3 w-3 rounded-full bg-white/40" />
              </div>
              <div className="h-2 w-2 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        <h1 className="text-6xl font-bold mb-4 tracking-tight">Oops!</h1>
        <p className="text-lg text-white/70 mb-2">
          We couldn't find the page you were looking for.
        </p>
        <p className="text-sm text-white/50 mb-8">
          This page is currently in development.
        </p>

        <Link
          to="/"
          className="inline-block rounded-full bg-white text-[#002e60] px-6 py-3 text-sm font-semibold hover:bg-white/90 transition"
        >
          Go back home
        </Link>
      </div>

      {/* Component-scoped CSS */}
      <style>{`
        .animate-gradient-slow {
          background: linear-gradient(135deg, #000428 0%, #002e60 50%, #004e92 100%);
          background-size: 220% 220%;
          animation: gradientPan 10s ease-in-out infinite;
        }
        @keyframes gradientPan {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 0%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 100%; }
          100% { background-position: 0% 50%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-gradient-slow { animation: none; background-position: 50% 50%; }
        }
      `}</style>
    </div>
  );
}
