import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    name: "Dr. Anjali Sharma",
    role: "Cardiologist · AIIMS Delhi",
    avatar: "AS",
    color: "bg-blue-100 text-blue-700",
    quote:
      "MediCare has completely transformed how I manage my patient load. The seamless record access and digital prescriptions alone save me two hours every day.",
    rating: 5,
  },
  {
    name: "Rahul Mehta",
    role: "Patient · Mumbai",
    avatar: "RM",
    color: "bg-violet-100 text-violet-700",
    quote:
      "I used to dread booking appointments. Now I can do it in under a minute from my phone. MediCare has made managing my health genuinely stress-free.",
    rating: 5,
  },
  {
    name: "Dr. Priya Singh",
    role: "Dermatologist · Apollo Hospitals",
    avatar: "PS",
    color: "bg-emerald-100 text-emerald-700",
    quote:
      "Patient records are always at my fingertips, securely. The platform is intuitive, fast, and my patients love the experience on their end too.",
    rating: 5,
  },
  {
    name: "Meera Iyer",
    role: "Healthcare Admin · Manipal",
    avatar: "MI",
    color: "bg-amber-100 text-amber-700",
    quote:
      "Managing scheduling for 30+ doctors used to be a nightmare. MediCare's admin tools brought it all under one roof — it's been a game-changer.",
    rating: 5,
  },
];

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback(
    (idx) => {
      setDirection(idx > current ? 1 : -1);
      setCurrent(idx);
    },
    [current]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

  const variants = {
    enter: (d) => ({ opacity: 0, x: d * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d * -40 }),
  };

  return (
    <section className="bg-slate-50 py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Testimonials</span>
          <h2 className="mt-3 text-4xl font-bold text-slate-900">Trusted by thousands</h2>
          <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto">
            Hear from the doctors, patients, and teams who rely on MediCare every day.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100"
            >
              {/* Quote mark */}
              <div className="text-6xl text-blue-100 font-serif leading-none select-none mb-2">"</div>

              <StarRating count={testimonials[current].rating} />

              <p className="mt-4 text-xl text-slate-700 leading-relaxed font-medium">
                {testimonials[current].quote}
              </p>

              {/* Author */}
              <div className="mt-8 flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${testimonials[current].color}`}
                >
                  {testimonials[current].avatar}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{testimonials[current].name}</p>
                  <p className="text-sm text-slate-400">{testimonials[current].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`rounded-full transition-all duration-300 ${
                  current === idx
                    ? "w-8 h-3 bg-blue-600"
                    : "w-3 h-3 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>

          {/* Prev/Next */}
          <button
            onClick={() => goTo((current - 1 + testimonials.length) % testimonials.length)}
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all"
            aria-label="Previous"
          >
            ←
          </button>
          <button
            onClick={() => next()}
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all"
            aria-label="Next"
          >
            →
          </button>
        </div>

        {/* Social proof strip */}
        {/* <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-50">
          {["Apollo Hospitals", "AIIMS", "Manipal Health", "Fortis", "Max Healthcare"].map((name) => (
            <span key={name} className="text-sm font-semibold text-slate-500 tracking-wide uppercase">
              {name}
            </span>
          ))}
        </div> */}
      </div>
    </section>
  );
}