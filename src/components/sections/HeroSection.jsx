// src/components/HeroSection.jsx
// npm i motion
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden min-h-screen flex items-center">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10 animate-gradient-slow" />

      {/* Spacer for fixed glass header height */}
      <div
        aria-hidden
        className="pointer-events-none h-16 w-full absolute top-0"
      />

      {/* Depth overlays to keep it moody and legible */}
      <div className="absolute inset-0 -z-10 bg-black/30" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 10% 20%, #ffffff 20%, transparent 20%), radial-gradient(1px 1px at 80% 30%, #ffffff 20%, transparent 20%), radial-gradient(1px 1px at 30% 80%, #ffffff 20%, transparent 20%)",
          backgroundSize: "120px 120px, 160px 160px, 200px 200px",
        }}
      />

      {/* Subtle, cool glows */}
      <div className="absolute -top-24 right-1/4 -z-10 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 -z-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/75 backdrop-blur-sm"
          >
            Launching Beta v0.1 Soon
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.05, ease: "easeOut" }}
            className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-6xl"
          >
            Collaborative AI for Legal Teams
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mt-4 text-base leading-7 text-white/85 sm:text-lg"
          >
            Review faster. Research deeper. Draft with confidence. Seamlessly
            collaborate with an AI assistant tuned to your firm’s playbooks,
            surfacing precedent and statutes in context so you can focus on
            strategy—not sifting through documents.
          </motion.p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              asChild
              className="rounded-full bg-white text-[#002e60] hover:bg-white/90"
            >
              <Link to="/consultation">Schedule a Consultation</Link>
            </Button>
            <Link
              to="/platform"
              className="text-sm font-medium text-white/90 hover:text-white underline-offset-4 hover:underline"
            >
              Explore Platform →
            </Link>
          </div>
        </div>
      </div>

      {/* Component-scoped CSS for gradient animation */}
      <style>{`
        .animate-gradient-slow {
          background: linear-gradient(135deg, #000428 0%, #002e60 50%, #004e92 100%);
          background-size: 220% 220%;
          animation: heroGradientPan 10s ease-in-out infinite; /* was 18s */
        }
        @keyframes heroGradientPan {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 0%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 100%; }
          100% { background-position: 0% 50%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-gradient-slow {
            animation: none;
            background-position: 50% 50%;
          }
        }
      `}</style>
    </section>
  );
}
