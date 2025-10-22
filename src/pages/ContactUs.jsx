// src/pages/ContactPage.jsx
import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { motion } from "framer-motion";
import { Shield, CreditCard, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure Legal Research",
    description:
      "Implement advanced security measures to protect your sensitive case files and client data.",
  },
  {
    icon: CreditCard,
    title: "Streamlined Case Analysis",
    description:
      "Create seamless, AI-powered legal research experiences that drive better outcomes.",
  },
  {
    icon: TrendingUp,
    title: "Optimize Research Performance",
    description:
      "Achieve your goals with smart RAG solutions built to improve research efficiency.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    industry: "",
    priority: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission
  };

  return (
    <div className="relative isolate overflow-hidden min-h-screen flex flex-col">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10 animate-gradient-slow" />

      {/* Depth overlays */}
      <div className="absolute inset-0 -z-10 bg-black/30" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 10% 20%, #ffffff 20%, transparent 20%), radial-gradient(1px 1px at 80% 30%, #ffffff 20%, transparent 20%), radial-gradient(1px 1px at 30% 80%, #ffffff 20%, transparent 20%)",
          backgroundSize: "120px 120px, 160px 160px, 200px 200px",
        }}
      />

      {/* Subtle glows */}
      <div className="absolute -top-24 right-1/4 -z-10 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 -z-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      <Header />

      <div className="flex-1 flex items-center justify-center px-6 py-20 relative z-10">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left Column - Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8 flex flex-col justify-center"
            >
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  Transform your legal research workflow
                </h1>
                <p className="text-lg text-gray-300">
                  Empower your law firm with AI-powered case analysis and
                  precedent discovery.
                </p>
              </div>

              <div className="space-y-6">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/30">
                      <feature.icon className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 h-fit shadow-lg"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-white/90 mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white/90 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@lawfirm.com"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-white/90 mb-2"
                  >
                    Company name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your law firm name"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="industry"
                    className="block text-sm font-medium text-white/90 mb-2"
                  >
                    Practice Area
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition appearance-none cursor-pointer backdrop-blur-sm"
                  >
                    <option value="" className="bg-gray-900 text-white/70">
                      Select practice area
                    </option>
                    <option value="corporate" className="bg-gray-900">
                      Corporate Law
                    </option>
                    <option value="litigation" className="bg-gray-900">
                      Litigation
                    </option>
                    <option value="criminal" className="bg-gray-900">
                      Criminal Defense
                    </option>
                    <option value="family" className="bg-gray-900">
                      Family Law
                    </option>
                    <option value="real-estate" className="bg-gray-900">
                      Real Estate
                    </option>
                    <option value="ip" className="bg-gray-900">
                      Intellectual Property
                    </option>
                    <option value="other" className="bg-gray-900">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-white/90 mb-2"
                  >
                    What is your top priority?
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition appearance-none cursor-pointer backdrop-blur-sm"
                  >
                    <option value="" className="bg-gray-900 text-white/70">
                      Select your priority
                    </option>
                    <option value="speed" className="bg-gray-900">
                      Faster legal research
                    </option>
                    <option value="accuracy" className="bg-gray-900">
                      Improved accuracy
                    </option>
                    <option value="collaboration" className="bg-gray-900">
                      Team collaboration
                    </option>
                    <option value="cost" className="bg-gray-900">
                      Cost reduction
                    </option>
                    <option value="integration" className="bg-gray-900">
                      System integration
                    </option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-white/90 transition duration-200 shadow-lg"
                >
                  Schedule a Demo
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Component-scoped CSS for gradient animation */}
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
        @media (prefers-reduced-motion: reduce) {
          .animate-gradient-slow {
            animation: none;
            background-position: 50% 50%;
          }
        }
      `}</style>
    </div>
  );
}
