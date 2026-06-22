import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const features = [
  {
    icon: "🩺",
    color: "bg-blue-50 text-blue-600",
    accent: "border-blue-200",
    tag: "Scheduling",
    title: "Book Appointments",
    desc: "Quickly find available slots and book online or in-person appointments with your preferred doctor in seconds.",
    bullets: ["Real-time availability", "Instant confirmations", "Reminders & rescheduling"],
  },
  {
    icon: "📁",
    color: "bg-violet-50 text-violet-600",
    accent: "border-violet-200",
    tag: "Records",
    title: "Manage Medical Records",
    desc: "Upload, organize, and access your complete medical history securely from any device, anytime.",
    bullets: ["End-to-end encryption", "Share with doctors", "Download anytime"],
  },
  {
    icon: "📝",
    color: "bg-emerald-50 text-emerald-600",
    accent: "border-emerald-200",
    tag: "Prescriptions",
    title: "Prescriptions & Notes",
    desc: "Doctors create digital notes and prescriptions that are instantly accessible to patients and pharmacies.",
    bullets: ["Digital prescriptions", "Follow-up notes", "Pharmacy integration"],
  },
  {
    icon: "🔔",
    color: "bg-amber-50 text-amber-600",
    accent: "border-amber-200",
    tag: "Alerts",
    title: "Smart Notifications",
    desc: "Stay on top of your health with intelligent reminders for medications, tests, and follow-ups.",
    bullets: ["Medication reminders", "Test result alerts", "Personalized schedule"],
  },
  {
    icon: "💬",
    color: "bg-pink-50 text-pink-600",
    accent: "border-pink-200",
    tag: "Communication",
    title: "Secure Messaging",
    desc: "Message your care team directly through an encrypted, HIPAA-compliant messaging system.",
    bullets: ["Direct doctor chat", "File attachments", "Message history"],
  },
  {
    icon: "📊",
    color: "bg-cyan-50 text-cyan-600",
    accent: "border-cyan-200",
    tag: "Insights",
    title: "Health Analytics",
    desc: "Track your health trends over time with visual dashboards and progress reports tailored for you.",
    bullets: ["Vitals tracking", "Progress charts", "Exported reports"],
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Features() {
  const [hovered, setHovered] = useState(null);

  return (
    <section id="features" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Features</span>
          <h2 className="mt-3 text-4xl font-bold text-slate-900 leading-tight">
            Everything you need, <br />nothing you don't
          </h2>
          <p className="mt-4 text-slate-500 text-lg leading-relaxed">
            A complete suite of tools designed to simplify healthcare management for patients, doctors, and staff.
          </p>
        </div>

        {/* Feature grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              className={`group relative rounded-2xl border p-6 cursor-default transition-all duration-300
                ${hovered === idx ? "shadow-lg -translate-y-1 border-slate-300 bg-white" : "border-slate-100 bg-slate-50 hover:bg-white"}
              `}
            >
              {/* Tag */}
              <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 ${f.color} border ${f.accent}`}>
                {f.tag}
              </span>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${f.color}`}>
                {f.icon}
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{f.desc}</p>

              {/* Bullet list */}
              <AnimatePresence>
                {hovered === idx && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    {f.bullets.map((b, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className={`w-1.5 h-1.5 rounded-full ${f.color.split(" ")[0].replace("bg-", "bg-").replace("50", "400")}`} />
                        {b}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}