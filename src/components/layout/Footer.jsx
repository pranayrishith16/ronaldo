// src/components/layout/Footer.jsx
import React from "react";

const columns = [
  {
    heading: "Products",
    links: ["Features", "Templates", "Pricing"].map(l => ({ label: l, href: `/${l.toLowerCase()}` }))
  },
  {
    heading: "Company",
    links: ["About", "Blog", "Careers"].map(l => ({ label: l, href: `/${l.toLowerCase()}` }))
  },
  {
    heading: "Build",
    links: ["Developer Docs", "API Platform", "dApps"].map(l => ({ label: l, href: `/${l.toLowerCase().replace(' ', '')}` }))
  },
  {
    heading: "Support",
    links: ["FAQ", "Community Forum", "Contact Us"].map(l => ({ label: l, href: `/${l.toLowerCase().replace(' ', '')}` }))
  }
];

export default function Footer() {
  return (
    <footer className="relative bg-neutral-900 text-neutral-300 overflow-visible">
      {/* Link Columns */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {columns.map(col => (
            <div key={col.heading}>
              <h4 className="mb-4 text-sm font-semibold uppercase text-white">{col.heading}</h4>
              <ul className="space-y-2 text-sm">
                {col.links.map(link => (
                  <li key={link.label}>
                    <a href={link.href} className="hover:text-white transition">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800 pb-4 pt-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
          <p className="text-xs">&copy; {new Date().getFullYear()} VERITLY AI Inc. All rights reserved.</p>
          <div className="flex space-x-6 text-xs">
            <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition">Terms of Service</a>
            <a href="/cookies" className="hover:text-white transition">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
