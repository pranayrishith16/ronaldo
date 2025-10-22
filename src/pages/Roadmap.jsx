// src/pages/RoadmapPage.jsx
import React, { useEffect } from "react";
import Header from "@/components/layout/Header";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock } from "lucide-react";

const roadmapItems = [
  {
    id: 1,
    status: "completed",
    phase: "MVP Development",
    quarter: "Q3 - 2025",
    title: "Veritly AI RAG Development & Deployment",
    description:
      "Built the core legal RAG system with case file retrieval and cloud deployment. Foundation for legal research automation.",
    features: [
      "Case file retrieval engine",
      "Natural language query processing",
      "AWS cloud deployment",
      "Basic RAG model deployment",
    ],
  },
  {
    id: 2,
    status: "in-progress",
    phase: "Current Focus",
    quarter: "Q4 - 2025",
    title: "File Upload & Enhanced Research",
    description:
      "Adding document upload functionality and improving research accuracy with statute linking and document management.",
    features: [
      "File upload functionality (PDF, DOCX, TXT)",
      "Statute linking & context retrieval",
      "Document management integration",
      "Response time optimization (2-3s target)",
      "Multi-attorney collaboration tools",
    ],
  },
  {
    id: 3,
    status: "planned",
    phase: "Next Up",
    quarter: "Q1 - 2026",
    title: "AI-Powered Insights & Analytics",
    description:
      "Launching intelligent analytics and citations to help attorneys make data-driven legal decisions and generate reports.",
    features: [
      "Citation generation & verification",
      "Legal trend analysis & predictions",
      "Automated research reports",
      "Custom legal playbooks & templates",
      "Advanced search filters & facets",
    ],
  },
  {
    id: 4,
    status: "future",
    phase: "Future",
    quarter: "Q2 - 2026",
    title: "Enterprise & Security",
    description:
      "Enterprise-grade features with enhanced security, compliance, and custom model training for large law firms.",
    features: [
      "Custom RAG model fine-tuning on firm data",
      "SOC 2 Type II & HIPAA compliance",
      "On-premise deployment options",
      "White-label solutions",
      "Advanced role-based access control",
      "Single Sign-On (SSO) integration",
    ],
  },
];

function StatusIcon({ status }) {
  if (status === "completed") {
    return <CheckCircle2 className="w-6 h-6 text-green-400" />;
  }
  if (status === "in-progress") {
    return <Clock className="w-6 h-6 text-blue-400" />;
  }
  return <Circle className="w-6 h-6 text-gray-500" />;
}

function StatusBadge({ status, quarter }) {
  const styles = {
    completed: "bg-green-500/20 text-green-300 border-green-500/30",
    "in-progress": "bg-blue-500/20 text-blue-300 border-blue-500/30",
    planned: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    future: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}
    >
      {quarter}
    </span>
  );
}

function RoadmapCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative"
    >
      {/* Timeline dot and line */}
      <div className="absolute left-0 top-8 bottom-0 w-px bg-gradient-to-b from-blue-500/50 to-transparent" />
      <div className="absolute left-0 top-2 flex items-center justify-center w-3 h-3 -ml-[5px]">
        <div className="w-full h-full bg-blue-500 rounded-full" />
      </div>

      {/* Card content */}
      <div className="ml-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <div>
            <StatusBadge status={item.status} quarter={item.quarter} />
            <h3 className="text-xl font-bold text-white mt-2">{item.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{item.phase}</p>
          </div>
          <StatusIcon status={item.status} />
        </div>

        <p className="text-gray-300 mb-4">{item.description}</p>

        <ul className="space-y-2">
          {item.features.map((feature, idx) => (
            <li key={idx} className="flex items-start text-sm text-gray-400">
              <span className="mr-2 text-blue-400">—</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function RoadmapPage() {
  useEffect(() => {
    document.title = "VERITLY AI - Product Roadmap";
  }, []);

  return (
    <div className="relative isolate overflow-hidden min-h-screen flex flex-col">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10 animate-gradient-slow" />
      <div className="absolute inset-0 -z-10 bg-black/30" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 10% 20%, #ffffff 20%, transparent 20%), radial-gradient(1px 1px at 80% 30%, #ffffff 20%, transparent 20%), radial-gradient(1px 1px at 30% 80%, #ffffff 20%, transparent 20%)",
          backgroundSize: "120px 120px, 160px 160px, 200px 200px",
        }}
      />
      <div className="absolute -top-24 right-1/4 -z-10 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 -z-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      <Header />

      <main className="flex-1 relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              The Roadmap
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              With the help of legal professionals and early adopters, these are
              the milestones we're working toward to make Veritly AI the most
              powerful legal research tool for every attorney.
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="space-y-8 relative">
            {roadmapItems.map((item, index) => (
              <RoadmapCard key={item.id} item={item} index={index} />
            ))}
          </div>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <p className="text-gray-300 mb-4">
              Have suggestions for future features?
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
            >
              Share Your Feedback
            </a>
          </motion.div>
        </div>
      </main>

      <style>{`
        .animate-gradient-slow {
          background: linear-gradient(135deg, #000428 0%, #002e60 50%, #004e92 100%);
          background-size: 220% 220%;
          animation: heroGradientPan 10s ease-in-out infinite;
        }
        @keyframes heroGradientPan {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 0%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 100%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
