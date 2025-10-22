// src/pages/TeamPage.jsx
import React, { useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import { motion } from "framer-motion";
import Bunty from "../assets/bunty.jpeg";
import Teja from "../assets/teja.jpeg";
import Sudheer from "../assets/sudheer.jpg";
import Rishi from "../assets/rishi.jpeg";

const teamMembers = [
  {
    id: 1,
    name: "Pranay Rishith Bondugula",
    designation: "Co-Founder, Chief Architect",
    image: Rishi,
    scale: 1.15,
    objectPosition: "center 90%",
  },
  {
    id: 2,
    name: "Sudheer Vindula",
    designation: "Co-Founder, Architect",
    image: Sudheer,
    scale: 1.1,
    objectPosition: "center 25%",
  },
  {
    id: 3,
    name: "Puneet Puttu",
    designation: "Architect",
    image: Bunty,
    scale: 1.2,
    objectPosition: "center 20%",
  },
  {
    id: 4,
    name: "Tejamanikanta Gudla",
    designation: "3D Artist",
    image: Teja,
    scale: 1.12,
    objectPosition: "center 28%",
  },
];

function TeamCard({ member }) {
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          ref.current.classList.add("opacity-100", "translate-y-0");
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center text-center transition-opacity transition-transform duration-700 ease-out opacity-0 translate-y-8"
    >
      <div
        className="w-full relative overflow-hidden rounded-lg"
        style={{ paddingBottom: "177.78%" }}
      >
        <img
          src={member.image}
          alt={member.name}
          className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out hover:scale-110"
          style={{
            objectFit: "cover",
            objectPosition: member.objectPosition,
            transform: `scale(${member.scale})`,
            transformOrigin: member.objectPosition,
          }}
        />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{member.name}</h3>
      <p className="text-sm text-gray-400">{member.designation}</p>
    </div>
  );
}

export default function TeamPage() {
  useEffect(() => {
    document.title = "VERITLY AI - Our Team";
  }, []);

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center animate-gradient-slow pt-16">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-6 px-4 w-full max-w-4xl"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Our Team
          </h1>
        </motion.section>

        <section className="w-[90vw] max-w-[1200px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-12">
          {teamMembers.map((m) => (
            <TeamCard key={m.id} member={m} />
          ))}
        </section>
      </main>

      <style jsx>{`
        .animate-gradient-slow {
          animation: teamGradient 15s ease infinite;
          background: linear-gradient(
            135deg,
            #000428 0%,
            #002e60 50%,
            #004e92 100%
          );
          background-size: 200% 200%;
        }
        @keyframes teamGradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
