import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserCircle2,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const menus = {
  PATIENT: [
    { name: "Dashboard", path: "/patient", icon: LayoutDashboard },
    { name: "Profile", path: "/patient/profile", icon: UserCircle2 },
  ],

  DOCTOR: [
    { name: "Dashboard", path: "/doctor", icon: LayoutDashboard },
    { name: "Profile", path: "/doctor/profile", icon: UserCircle2 },
  ],

  STAFF: [
    { name: "Dashboard", path: "/staff", icon: LayoutDashboard },
    { name: "Profile", path: "/staff/profile", icon: UserCircle2 },
  ],
};

export default function Sidebar({
  role,
  open,
  onClose,
  collapsed,
  setCollapsed,
}) {
  const location = useLocation();
  const menu = menus[role] || [];

  useEffect(() => {
    const saved = localStorage.getItem("collapsed");
    setCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("collapsed", collapsed);
  }, [collapsed]);
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          ${collapsed ? "w-20" : "w-64"}
          h-screen bg-white border-r shadow-lg
          flex flex-col
          transform transition-all duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <Stethoscope className="w-6 h-6 text-blue-600 shrink-0" />

            {!collapsed && (
              <span className="font-bold text-2xl text-blue-600">Medicare</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Collapse Button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1 rounded hover:bg-gray-100"
            >
              {collapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>

            {/* Mobile Close */}
            <button onClick={onClose} className="md:hidden">
              <X />
            </button>
          </div>
        </div>

        {/* Menu */}
        <ul className="mt-4 flex-1 px-2">
          {menu.map(({ name, path, icon: Icon }) => {
            const active = location.pathname === path;

            return (
              <li key={path} className="mb-2">
                <Link
                  to={path}
                  onClick={onClose}
                  className={`
                    flex items-center
                    ${collapsed ? "justify-center" : "gap-3"}
                    py-3 px-4 rounded-xl
                    transition-all duration-200
                    ${
                      active
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-700 hover:bg-blue-50"
                    }
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0" />

                  {!collapsed && <span className="font-medium">{name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="p-4 border-t text-center text-gray-500 text-sm">
          {!collapsed ? "© 2025 Medicare" : "©"}
        </div>
      </aside>
    </>
  );
}
