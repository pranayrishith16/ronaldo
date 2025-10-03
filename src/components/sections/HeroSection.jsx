// npm i motion
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function HeroSection() {
  return (
    <section
      className="relative flex items-center justify-center bg-[#171717] px-6"
      style={{ minHeight: "calc(100vh - 4rem)" }}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1000px_600px_at_50%_-200px,rgba(0,0,0,0.03),transparent)]" />

      <motion.div
        className="mx-auto max-w-5xl text-center space-y-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
      >
        <motion.span
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
          }}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/60 px-3 py-1 text-[11px] font-medium tracking-wide text-neutral-700"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Launching Beta v0.1 Soon
        </motion.span>

        <motion.h1
          className="font-serif text-5xl sm:text-6xl md:text-7xl leading-tight text-neutral-100"
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
          }}
        >
          Collaborative AI <br /> for Legal Teams
        </motion.h1>

        <motion.p
          className="text-xs uppercase tracking-[0.25em] text-neutral-400"
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
          }}
        >
          Review faster. Research deeper. Draft with confidence
        </motion.p>

        <motion.p
          className="max-w-3xl text-[17px] leading-7 text-neutral-400 mx-auto"
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
          }}
        >
          Seamlessly collaborate with an AI assistant tuned to your firm’s playbooks, surfacing precedent and statutes in context so you can focus on strategy—not sifting through documents.
        </motion.p>

        <motion.div
          className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
          }}
        >
          <Button className="rounded-full bg-neutral-900 px-6 py-3 text-white hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-blue-600">
            Schedule a Consultation
          </Button>
          <Link to="/chat">
            <Button
              variant="outline"
              className="rounded-full border border-neutral-300 bg-white px-6 py-3 text-neutral-900 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
            >
              Explore Platform →
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
