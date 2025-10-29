// src/components/layout/Header.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../store/slices/authSlice";
import { Menu, X } from "lucide-react";

const navItems = [
  { name: "Roadmap", path: "/roadmap" },
  { name: "Pricing", path: "/pricing" },
  { name: "Team", path: "/team" },
  { name: "About", path: "/about" },
];

export default function Header() {
  const loc = useLocation().pathname;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [openIndex, setOpenIndex] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { isLoggedIn, user } = useSelector((state) => state.auth);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

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
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tight text-white">
          VERITLY AI
        </Link>

        {/* Desktop Navigation */}
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

        {/* Desktop CTA Buttons */}
        <div className="hidden lg:flex items-center space-x-3">
          <Link
            to="/login"
            className="px-6 py-2 text-sm font-medium text-white border border-white/20 rounded-lg hover:bg-white/5 hover:border-white/40 transition duration-200"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-200 shadow-lg hover:shadow-blue-500/50"
          >
            Try it for Free
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white hover:bg-white/10 p-2 rounded-md transition"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[rgba(0,4,40,0.95)] backdrop-blur-lg border-t border-white/10">
          <nav className="px-6 py-4 space-y-4">
            {navItems.map((item) => {
              const isActive = loc === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-sm font-medium py-2 transition-colors ${
                    isActive
                      ? "text-white border-l-2 border-sky-400 pl-3"
                      : "text-blue-100/70 hover:text-white pl-3"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile CTA Buttons */}
          <div className="px-6 py-4 border-t border-white/10 space-y-3">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-6 py-2 text-sm font-medium text-white border border-white/20 rounded-lg hover:bg-white/5 hover:border-white/40 transition duration-200"
            >
              Login
            </Link>
            <Link
              to="/demo"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-200 shadow-lg hover:shadow-blue-500/50"
            >
              Request Demo
            </Link>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute right-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-sky-400/10 blur-2xl" />
    </header>
  );
}
