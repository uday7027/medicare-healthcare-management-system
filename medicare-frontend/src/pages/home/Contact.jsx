import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/ui/Navbar";

const contactOptions = [
  { icon: "📧", label: "Email Support", value: "support@medicare.com", href: "mailto:support@medicare.com", desc: "We reply within 2 hours" },
  { icon: "📞", label: "Call Us", value: "+91 98765 43210", href: "tel:+919876543210", desc: "Mon–Sat, 9AM–6PM IST" },
  { icon: "💬", label: "Live Chat", value: "Start a conversation", href: "#chat", desc: "Typically replies instantly" },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (<>
    <Navbar/>
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Contact</span>
          <h2 className="mt-3 text-4xl font-bold text-slate-900">We're here to help</h2>
          <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto">
            Have a question or need support? Reach out and our team will get back to you quickly.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Contact options */}
          <motion.div
            className="flex-1 space-y-4"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {contactOptions.map((opt, i) => (
              <a
                key={i}
                href={opt.href}
                className="flex items-center gap-5 p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {opt.icon}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{opt.label}</p>
                  <p className="text-blue-600 text-sm font-medium">{opt.value}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{opt.desc}</p>
                </div>
              </a>
            ))}

            {/* Map / Location */}
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50">
              <p className="font-semibold text-slate-900 mb-1">📍 Headquarters</p>
              <p className="text-sm text-slate-500">MediCare Pvt. Ltd.<br />KIT's College of Engineering, Kolhapur <br />416234</p>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            className="flex-1 w-full"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-slate-50 rounded-3xl border border-slate-100 p-8">
              {!submitted ? (
                <>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Send us a message</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1.5">Your name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Rahul Mehta"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1.5">Email address</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="rahul@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1.5">Message</label>
                      <textarea
                        rows={4}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="How can we help you?"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition resize-none"
                      />
                    </div>
                    <button
                      onClick={handleSubmit}
                      className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Send message →
                    </button>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Message sent!</h3>
                  <p className="text-slate-500 text-sm">Thanks, {form.name || "there"}! We'll get back to you at <span className="text-blue-600">{form.email}</span> within 2 hours.</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
    </>
  );
}