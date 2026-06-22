import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Menu } from "lucide-react";

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // ensure logout logic runs (clear tokens, etc.)
      navigate("/"); // redirect to home or login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex items-center justify-between bg-white shadow-md px-6 py-4 rounded-md sticky top-0 z-50"
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <Menu size={22} />
        </button>

        <div className="w-10 h-10 bg-blue-100 text-blue-600 font-bold flex items-center justify-center rounded-full uppercase">
          {user?.name?.[0] || "U"}
        </div>

        <p className="text-gray-700 font-semibold text-lg">
          Welcome, <span className="text-blue-600">{user?.name}</span>
        </p>
      </div>

      {/* Right Section */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 hover:shadow-md transition-all duration-200"
      >
        <LogOut size={18} />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </motion.header>
  );
}
