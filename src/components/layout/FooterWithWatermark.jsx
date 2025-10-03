// src/components/layout/FooterWithWatermark.jsx
import React from "react";
import Footer from "./Footer";

export default function FooterWithWatermark() {
  return (
    <>
      <Footer />

      {/* Large straight watermark strip */}
      <div className="relative bg-neutral-900 overflow-hidden h-64">
        <span
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
                     whitespace-nowrap text-[20rem] font-bold text-white/5 leading-none select-none"
        >
          VERITLY AI
        </span>
      </div>
    </>
  );
}
