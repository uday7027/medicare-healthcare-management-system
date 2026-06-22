import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navbarHeight = 80; // Approximate height of navbar in px

  const navLinks = [
    { name: "Features", path: "/features", type: "route" }, // scroll link
    { name: "About", path: "/about", type: "route" },
    { name: "Contact", path: "/contact", type: "route" },
  ];

  const handleScroll = (e, id) => {
    e.preventDefault();
    const element = document.querySelector(id);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setOpen(false); // close mobile menu
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4">
          <img
            src="/logo1.png"
            alt="MediCare logo"
            className="h-16 w-auto transition-transform duration-300 hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.type === "scroll" ? (
              <a
                key={link.name}
                href={link.path}
                onClick={(e) => handleScroll(e, link.path)}
                className="relative text-sm font-medium text-gray-700 hover:text-primary transition-colors duration-200"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.path}
                className={`relative text-sm font-medium transition-colors duration-200 ${
                  location.pathname === link.path ? "text-primary" : "text-gray-700 hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            )
          )}
          <Link
            to="/login"
            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium shadow-md transition transform hover:scale-105 hover:shadow-lg"
          >
            Login
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {open ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full h-full bg-white backdrop-blur-sm transition-transform duration-300 ease-in-out z-40 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-6 flex flex-col space-y-5">
          {navLinks.map((link) =>
            link.type === "scroll" ? (
              <a
                key={link.name}
                href={link.path}
                onClick={(e) => handleScroll(e, link.path)}
                className="text-lg font-medium text-gray-700 hover:text-primary transition-colors duration-200"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setOpen(false)}
                className={`text-lg font-medium transition-colors duration-200 ${
                  location.pathname === link.path ? "text-primary" : "text-gray-700 hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            )
          )}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="px-4 py-2 bg-primary text-white rounded-md text-center font-medium shadow-md transition transform hover:scale-105 hover:shadow-lg"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
