// src/components/layout/Header.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { name: "Products", path: "/products" },
  { name: "Customers", path: "/customers" },
  { name: "Security", path: "/security" },
  { name: "News", path: "/news" },
  { name: "Company", path: "/company" }
];

export default function Header() {
  const loc = useLocation().pathname;

  return (
    <header className="sticky top-0 z-50 bg-[#171717] border-b border-neutral-700">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tight text-white">
          VERITLY AI
        </Link>

        {/* Navigation */}
        <nav aria-label="Primary navigation" className="hidden lg:block">
          <ul className="flex space-x-8">
            {navItems.map((item) => {
              const isActive = loc === item.path;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative pb-2 text-sm font-medium transition-colors
                      ${isActive
                        ? "text-neutral before:absolute before:-bottom-0 before:left-0 before:h-0.5 before:w-full before:bg-blue-600"
                        : "text-neutral-400 hover:text-neutral-100 hover:before:absolute hover:before:-bottom-0 hover:before:left-0 hover:before:h-0.5 hover:before:w-full hover:before:bg-neutral-300"
                      }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-6">
          <Link
            to="/login"
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm text-white hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-blue-600 transition"
          >
            Login
          </Link>
          <Link
            to="/demo"
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm text-white hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-blue-600 transition"
          >
            Request Demo
          </Link>
        </div>
      </div>
    </header>
  );
}
