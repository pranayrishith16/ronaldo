// src/pages/PricingPage.jsx
import React, { useEffect } from "react";
import Header from "@/components/layout/Header";
import { motion } from "framer-motion";
import { Check } from "lucide-react"; // npm install lucide-react
import { Link } from "react-router-dom";


const plans = [
  {
    id: 0,
    name: "Free Plan",
    subtitle: "Try our AI legal research assistant",
    price: "$0",
    period: "/month",
    features: [
      "3 queries/day (up to 10 during launch)",
      "Case file retrieval & analysis",
      "Basic statute & precedent search",
      "Limited document uploads (10 MB/month)",
      "Community support",
    ],
    buttonText: "Sign Up Free",
    buttonStyle: "bg-white text-blue-600 hover:bg-gray-100",
    popular: false,
  },
  // {
  //   id: 1,
  //   name: "Solo Practitioner",
  //   subtitle: "For individual attorneys and solo practices",
  //   price: "$139",
  //   period: "/month",
  //   features: [
  //     "Up to 10,000 legal queries/month",
  //     "Case file & statute retrieval",
  //     "Precedent analysis & research",
  //     "Unlimited document uploads",
  //     "Response time: 5-10 seconds",
  //     "Email support (24-48 hour response)",
  //   ],
  //   buttonText: "Start Free Trial",
  //   buttonStyle: "bg-white text-gray-900 hover:bg-gray-100",
  //   popular: false,
  // },
  // {
  //   id: 2,
  //   name: "Law Firm",
  //   subtitle: "For small to mid-size law firms & legal teams",
  //   price: "$350",
  //   period: "/month",
  //   badge: "MOST POPULAR",
  //   features: [
  //     "Up to 50,000 legal queries/month",
  //     "Advanced case file & statute retrieval",
  //     "Multi-attorney collaboration (up to 5 users)",
  //     "Precedent analysis & legal research",
  //     "Fast response time: 2-3 seconds",
  //     "Legal document management integration",
  //     "Priority support (4-hour response)",
  //     "API access for LMS/CMS integration",
  //   ],
  //   buttonText: "Start Free Trial",
  //   buttonStyle: "bg-white text-blue-600 hover:bg-gray-100",
  //   popular: true,
  // },
  {
    id: 3,
    name: "Enterprise",
    subtitle: "Custom features for large law firms and legal departments",
    price: "Custom",
    features: [
      "Unlimited queries",
      "Case file retrieval",
      "Unlimited users and cases",
      "Dedicated account manager",
      "Custom RAG model fine-tuning",
      "Advanced security & compliance (SOC 2, HIPAA)",
      "On-premise deployment option",
      "24/7 priority support",
    ],
    buttonText: "Contact Sales",
    buttonStyle: "bg-blue-600 text-white hover:bg-blue-700",
    popular: false,
  },
];


function PricingCard({ plan }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative rounded-lg p-8 flex flex-col ${
        plan.popular
          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white scale-105 shadow-2xl"
          : "bg-gray-900 text-white border border-gray-800"
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-xs font-bold px-4 py-1 rounded-full">
          {plan.badge}
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
        <p
          className={`text-sm ${
            plan.popular ? "text-blue-100" : "text-gray-400"
          }`}
        >
          {plan.subtitle}
        </p>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center">
          <span className="text-5xl font-extrabold">{plan.price}</span>
          <span
            className={`ml-2 text-lg ${
              plan.popular ? "text-blue-100" : "text-gray-400"
            }`}
          >
            {plan.period}
          </span>
        </div>
      </div>

      <Link
        to={
          plan.buttonText === "Sign Up Free"
            ? "/signup"
            : plan.buttonText === "Contact Sales"
            ? "/contact"
            : "/login"
        }
        className={`w-full py-3 rounded-lg font-semibold transition mb-6 block text-center ${plan.buttonStyle}`}
      >
        {plan.buttonText}
      </Link>

      <ul className="space-y-3 flex-1">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <Check
              className={`w-5 h-5 mr-3 flex-shrink-0 ${
                plan.popular ? "text-white" : "text-blue-400"
              }`}
            />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function PricingPage() {
  useEffect(() => {
    document.title = "VERITLY AI - Pricing";
  }, []);

  // Dynamically determine grid columns based on plan count
  const getGridClass = () => {
    const planCount = plans.length;
    if (planCount === 1) return "grid-cols-1";
    if (planCount === 2) return "grid-cols-1 md:grid-cols-2";
    if (planCount === 3) return "grid-cols-1 md:grid-cols-3";
    if (planCount === 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"; // fallback
  };

  // Determine max width based on plan count
  const getMaxWidth = () => {
    const planCount = plans.length;
    if (planCount === 1) return "max-w-md";
    if (planCount === 2) return "max-w-4xl";
    if (planCount === 3) return "max-w-6xl";
    if (planCount === 4) return "max-w-7xl";
    return "max-w-6xl";
  };

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center pt-20 pb-16 px-4">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 max-w-3xl"
        >
          <span className="inline-block px-4 py-1 bg-blue-900 text-blue-300 text-sm font-semibold rounded-full mb-4">
            PRICING
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Flexible Plans for Every Business Size
          </h1>
          <p className="text-lg text-gray-400">
            Choose the perfect plan that fits your needs—whether you're a
            startup, an agency, or a large enterprise.
          </p>
        </motion.section>

        <section
          className={`w-full ${getMaxWidth()} grid ${getGridClass()} gap-8`}
        >
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-4">
            Not sure which plan is right for you?{" "}
            <a
              href="/contact"
              className="text-blue-400 hover:underline font-semibold"
            >
              Contact our team
            </a>
          </p>
        </motion.section>
      </main>
    </div>
  );
}