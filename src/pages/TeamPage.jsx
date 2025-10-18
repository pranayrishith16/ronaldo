// src/pages/TeamPage.jsx
import React, { useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import { motion } from "framer-motion";

const teamMembers = [
  {
    id: 1,
    name: "Michael Scott",
    designation: "Co-Founder, Chief Architect",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Chandler Rigs",
    designation: "Co-Founder, Architect",
    image: "https://randomuser.me/api/portraits/men/33.jpg",
  },
  {
    id: 3,
    name: "Isabella Rodriguez",
    designation: "Architect",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 4,
    name: "Ava Wilson",
    designation: "3D Artist",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
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
      <div className="w-full relative" style={{ paddingBottom: "177.78%" }}>
        <img
          src={member.image}
          alt={member.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-105"
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
          className="text-center py-12 px-4 w-full max-w-4xl"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Our Team
          </h1>
          <p className="text-gray-300 text-base sm:text-lg">
            We craft solutions that amplify key characteristics, achieving a
            harmonious balance of function and intent.
          </p>
        </motion.section>

        <section className="w-[90vw] max-w-[1200px] grid grid-cols-4 gap-8 pb-12">
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
