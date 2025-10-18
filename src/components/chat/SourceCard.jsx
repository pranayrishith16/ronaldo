// src/components/SourceCard.jsx
import React from "react";

export default function SourceCard({ source, index }) {
  return (
    <div className="bg-gray-800/50 hover:bg-gray-800 transition-colors border border-gray-700/50 rounded-lg p-3 text-sm shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-purple-400 font-medium text-xs">
          Source {index + 1}
        </div>
        <div className="text-gray-500 text-xs">Page {source.page_number}</div>
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
}
