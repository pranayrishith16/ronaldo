// src/components/layout/FooterWithWatermark.jsx
import React from "react";
import Footer from "./Footer";

export default function FooterWithWatermark() {
  return (
    <div className="relative">
      {/* Watermark behind the footer */}
      <div
        className="absolute inset-0 -z-20 flex items-center justify-center"
        style={{ opacity: 0.1 }}
        aria-hidden
      >
        <span
          className="w-full text-center text-[18rem] font-extrabold leading-none select-none
                     text-transparent [text-stroke:2px_rgba(255,255,255,0.15)]"
        >
          VERITLY AI
        </span>
      </div>

      {/* The actual footer */}
      <Footer />
    </div>
  );
}
