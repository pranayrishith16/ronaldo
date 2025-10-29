import React from "react";
import { Link } from "react-router-dom";
import backgroundImage from "../../assets/login-background.jpg"; // replace with your image path

export default function LeftPanel() {
  return (
    <div
      className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-900 to-blue-950 relative p-8 bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-blue-950/60"></div>

      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          className="text-white text-2xl font-extrabold tracking-tight hover:text-blue-300"
        >
          VERITLY AI
        </Link>
      </div>
      <div className="mt-auto mb-12 z-10">
        <h1 className="text-4xl font-bold text-white">
          Be a Part of
          <br />
          Something <span className="text-blue-300">Beautiful</span>
        </h1>
      </div>
    </div>
  );
}
