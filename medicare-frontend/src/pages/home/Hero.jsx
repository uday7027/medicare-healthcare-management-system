import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DemoModal from "./DemoModal";

// const stats = [
//   { value: "50K+", label: "Patients served" },
//   { value: "1,200+", label: "Doctors onboard" },
//   { value: "99.9%", label: "Uptime" },
// ];

export default function Hero() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <section className="relative overflow-hidden bg-[#f0f7ff] min-h-[90vh] flex items-center">
      {/* Background decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-80px] right-[-80px] w-[420px] h-[420px] rounded-full bg-blue-100 opacity-60" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-cyan-100 opacity-50" />
        <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] rounded-full bg-blue-50 opacity-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left content */}
          <motion.div
            className="flex-1 max-w-xl"
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          >
            {/* Badge */}
            {/* <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white border border-blue-200 text-blue-600 text-sm font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Now live · Trusted by 50,000+ patients
            </motion.div> */}

            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight text-slate-900 mb-6">
              Healthcare that{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-blue-600">moves with you</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-blue-100 rounded-sm -z-0" />
              </span>
            </h1>

            <p className="text-lg text-slate-500 leading-relaxed mb-8">
              Book appointments, access records, and collaborate with your care team — all in one beautifully secure platform.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-12">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all duration-300 hover:-translate-y-0.5"
              >
                Get started free
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <button
                onClick={() => setShowDemo(true)}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-slate-700 font-semibold rounded-2xl border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-300"
              >
                <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">▶</span>
                See how it works
              </button>
            </div>

          </motion.div>

          {/* Right illustration area */}
          <motion.div
            className="flex-1 flex justify-center relative"
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: "easeOut", delay: 0.15 }}
          >
            {/* Floating card: Appointment */}
            <motion.div
              className="absolute top-0 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 z-10 border border-slate-100"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500 text-lg">✓</div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Appointment confirmed</p>
                <p className="text-xs text-slate-400">Today at 10:30 AM</p>
              </div>
            </motion.div>

            {/* Floating card: Prescription */}
            <motion.div
              className="absolute bottom-8 -right-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 z-10 border border-slate-100"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 text-lg">💊</div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Prescription ready</p>
                <p className="text-xs text-slate-400">Dr. Anjali Sharma</p>
              </div>
            </motion.div>

            {/* Main illustration container */}
            <div className="relative w-80 h-80 lg:w-96 lg:h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-cyan-100 rounded-[3rem] rotate-6 opacity-50" />
              <div className="absolute inset-0 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center overflow-hidden">
                <img
                  src="/illustrations/hero.png"
                  alt="Healthcare illustration"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.classList.add("bg-gradient-to-br", "from-blue-50", "to-cyan-50");
                    e.target.parentElement.innerHTML += `
                      <div style="text-align:center; padding: 2rem;">
                        <div style="font-size: 5rem;">🏥</div>
                        <p style="color:#3b82f6; font-weight:600; margin-top:1rem;">MediCare</p>
                      </div>`;
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <AnimatePresence>
        {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
      </AnimatePresence>
    </section>
  );
}