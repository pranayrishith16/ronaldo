// src/pages/HomePage.jsx
import React from "react";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/sections/HeroSection";
import FooterWithWatermark from "../components/layout/FooterWithWatermark";

export default function HomePage() {
  return (
    <div className="min-h-screen text-neutral-900">
      <Header />
      <HeroSection />
      <FooterWithWatermark />
    </div>
  );
}
