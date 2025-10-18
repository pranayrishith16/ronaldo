// src/components/layout/Header.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { name: "Products", path: "/products" },
  { name: "Customers", path: "/customers" },
  { name: "Security", path: "/security" },
  { name: "News", path: "/news" },
  {
    name: "Company",
    path: "/company",
    submenu: [
      { label: "About", path: "/about" },
      { label: "The Team", path: "/team" },
    ],
  },
];

export default function Header() {
  const loc = useLocation().pathname;
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <header
      className={`
        fixed inset-x-0 top-0 z-50
        border-b bg-[rgba(0,4,40,0.35)] backdrop-blur-lg
        border-white/10
      `}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/15" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link to="/" className="text-2xl font-bold tracking-tight text-white">
          VERITLY AI
        </Link>

        <nav aria-label="Primary navigation" className="hidden lg:block">
          <ul className="flex space-x-8">
            {navItems.map((item, idx) => {
              const isActive =
                loc === item.path ||
                (item.submenu && loc.startsWith(item.path));

              return (
                <li
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.submenu && setOpenIndex(idx)}
                  onMouseLeave={() => item.submenu && setOpenIndex(null)}
                >
                  <Link
                    to={item.path}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative pb-2 text-sm font-medium transition-colors
                      ${
                        isActive
                          ? "text-white before:absolute before:-bottom-0 before:left-0 before:h-0.5 before:w-full before:bg-sky-400"
                          : "text-blue-100/70 hover:text-white hover:before:absolute hover:before:-bottom-0 hover:before:left-0 hover:before:h-0.5 hover:before:w-full hover:before:bg-blue-200/70"
                      }`}
                  >
                    {item.name}
                  </Link>

                  {item.submenu && openIndex === idx && (
                    <ul
                      className="absolute left-0 top-full mt-1 rounded-md bg-white/10 backdrop-blur-md border border-white/20 p-2 shadow-lg z-50"
                      style={{ minWidth: "7rem" }}
                    >
                      {item.submenu.map((sub) => (
                        <li key={sub.label}>
                          <Link
                            to={sub.path}
                            className="block px-3 py-2 text-sm text-white/80 hover:text-white transition"
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center space-x-6">
          <Link
            to="/login"
            className="rounded-full bg-white/10 px-5 py-2 text-sm text-white hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-sky-400 transition"
          >
            Login
          </Link>
          <Link
            to="/demo"
            className="rounded-full bg-white/10 px-5 py-2 text-sm text-white hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-sky-400 transition"
          >
            Request Demo
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute right-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-sky-400/10 blur-2xl" />
    </header>
  );
}
