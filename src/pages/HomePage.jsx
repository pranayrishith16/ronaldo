// src/pages/HomePage.jsx
import React, { useEffect } from "react";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/sections/HeroSection";
// import FooterWithWatermark from "../components/layout/FooterWithWatermark";
import Footer from "@/components/layout/Footer"

export default function HomePage() {
  useEffect(() => {
    document.title = "Veritly AI - Home"
  },[])
  return (
    <div className="min-h-screen text-neutral-900">
      <Header />
      <HeroSection />
      <Footer />
    </div>
  );
}
