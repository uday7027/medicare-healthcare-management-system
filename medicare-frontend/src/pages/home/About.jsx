import React from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/ui/Navbar";

const pillars = [
  { icon: "🛡️", title: "Privacy First", desc: "HIPAA-compliant infrastructure with end-to-end encryption." },
  { icon: "⚡", title: "Built for Speed", desc: "Designed for busy clinics — fast, reliable, zero downtime." },
  { icon: "🤝", title: "Human-Centered", desc: "Every feature is shaped around real patient and doctor needs." },
];

export default function About() {
  return (<>
    <Navbar/>
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            className="flex-1 max-w-xl"
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">About MediCare</span>
            <h2 className="mt-3 text-4xl font-bold text-slate-900 leading-tight">
              Built to bridge the gap in modern healthcare
            </h2>
            <p className="mt-5 text-slate-500 text-lg leading-relaxed">
              MediCare was founded with a single belief: that accessing quality healthcare shouldn't be complicated.
              We connect patients, doctors, and staff through a platform that prioritizes simplicity, security, and speed.
            </p>
            <p className="mt-4 text-slate-500 leading-relaxed">
              From rural clinics to large hospital networks, our platform adapts to every care setting — making healthcare
              management effortless for everyone involved.
            </p>

            <div className="mt-8 flex items-center gap-6">
              <div>
                <p className="text-3xl font-bold text-slate-900">2019</p>
                <p className="text-sm text-slate-400 mt-0.5">Founded</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div>
                <p className="text-3xl font-bold text-slate-900">18+</p>
                <p className="text-sm text-slate-400 mt-0.5">States covered</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div>
                <p className="text-3xl font-bold text-slate-900">4.9★</p>
                <p className="text-sm text-slate-400 mt-0.5">Average rating</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Pillars */}
          <motion.div
            className="flex-1 grid grid-cols-1 gap-5"
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {pillars.map((p, i) => (
              <div
                key={i}
                className="flex items-start gap-5 p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md hover:border-slate-200 transition-all duration-300"
              >
                <div className="text-3xl flex-shrink-0">{p.icon}</div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{p.title}</h3>
                  <p className="text-slate-500 text-sm mt-1 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
    </>
  );
}