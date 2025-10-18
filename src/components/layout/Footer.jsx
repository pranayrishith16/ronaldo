// src/components/layout/Footer.jsx
import React from "react";
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

const columns = [
  {
    heading: "Products",
    links: ["Features", "Templates", "Pricing"].map((l) => ({
      label: l,
      href: `/${l.toLowerCase()}`,
    })),
  },
  {
    heading: "Company",
    links: ["About", "Blog", "Careers"].map((l) => ({
      label: l,
      href: `/${l.toLowerCase()}`,
    })),
  },
  {
    heading: "Resources",
    links: ["Docs", "API", "Community"].map((l) => ({
      label: l,
      href: `/${l.toLowerCase()}`,
    })),
  },
];

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden text-white">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#000428] via-[#002e60] to-[#004e92] bg-[length:200%_200%] animate-footer-pan" />

      {/* Newsletter & Social */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-semibold">Stay in the loop</h3>
            <p className="mt-2 text-sm text-white/75">
              Subscribe to our newsletter for product updates and insights.
            </p>
          </div>
          <form className="flex w-full max-w-md items-center gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="w-full rounded-l-md border border-white/30 bg-white/10 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#002e60]"
            />
            <button
              type="submit"
              className="rounded-r-md bg-[#002e60] px-4 py-2 text-sm font-semibold hover:bg-[#004e92] transition"
            >
              Subscribe
            </button>
          </form>
          <div className="flex items-center gap-4 text-2xl">
            <a href="#" className="hover:text-[#02a3ff]">
              <FaTwitter />
            </a>
            <a href="#" className="hover:text-[#02a3ff]">
              <FaLinkedin />
            </a>
            <a href="#" className="hover:text-[#02a3ff]">
              <FaGithub />
            </a>
          </div>
        </div>
      </div>

      {/* Link Columns */}
      {/* <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-4 text-sm font-semibold uppercase">
                {col.heading}
              </h4>
              <ul className="space-y-2 text-sm text-white/75">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="transition hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div> */}

      {/* Bottom Bar */}
      <div className="border-t border-white/20 px-6 py-6 lg:px-8">
        <div className="mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-white/75">
            &copy; {new Date().getFullYear()} VERITLY AI Inc. All rights
            reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <a href="/privacy" className="hover:text-white transition">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-white transition">
              Terms of Service
            </a>
            <a href="/cookies" className="hover:text-white transition">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>

      {/* Footer Animations */}
      <style>{`
        .animate-footer-pan {
          animation: panBackground 15s linear infinite;
        }
        @keyframes panBackground {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-footer-pan { animation: none; background-position: 50% 50%; }
        }
      `}</style>
    </footer>
  );
}
