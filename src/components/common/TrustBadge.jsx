// src/components/common/TrustBadge.jsx
import React from "react";

export default function TrustBadge() {
  return (
    <div className="inline-flex items-center gap-2 bg-neutral-100 backdrop-blur-sm border border-neutral-200 rounded-full px-4 py-2">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-neutral-700 text-xs uppercase tracking-wider font-medium">
        Beta: Case-Cited AI Answers
      </span>
    </div>
  );
}
