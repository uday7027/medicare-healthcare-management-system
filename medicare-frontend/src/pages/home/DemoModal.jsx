import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, RotateCcw } from "lucide-react";

// ─── Mock data used throughout the demo ───────────────────────────────────────
const MOCK_NOTE = `Patient: Rahul Mehta | Age: 34
Chief Complaint: Fever, dry cough, body aches for 3 days.
Diagnosis: Viral Upper Respiratory Tract Infection

Rx:
1. Tab Paracetamol 500mg - 1 tab TID x 5 days (after meals)
2. Tab Cetirizine 10mg - 1 tab OD at night x 5 days
3. Syp Benadryl 10ml TID x 5 days (cough syrup)
4. Tab Vitamin C 500mg - 1 tab OD x 10 days

General Advice: Rest well, drink warm fluids, avoid cold food.
Follow up after 5 days if symptoms persist.`;

const MOCK_TRANSLATED = `रुग्ण: राहुल मेहता | वय: ३४
मुख्य तक्रार: ताप, कोरडा खोकला, तीन दिवसांपासून अंगदुखी.
निदान: व्हायरल अप्पर रेस्पिरेटरी ट्रॅक्ट इन्फेक्शन

Rx:
1. पॅरासिटामॉल ५००मिग्रॅ - दिवसातून ३ वेळा x ५ दिवस
2. सेटिरिझिन १०मिग्रॅ - रात्री १ गोळी x ५ दिवस
3. बेनाड्रिल सिरप - दिवसातून ३ वेळा x ५ दिवस
4. व्हिटॅमिन C ५००मिग्रॅ - दिवसातून १ वेळा x १० दिवस

सामान्य सल्ला: विश्रांती घ्या, उबदार द्रव प्या.`;

const MOCK_MEDICINES = [
  { name: "Paracetamol 500mg", dosage: "500mg", frequency: "TID", days: "5", instructions: "After meals" },
  { name: "Cetirizine 10mg",   dosage: "10mg",  frequency: "OD",  days: "5", instructions: "At night" },
  { name: "Benadryl Syrup",    dosage: "10ml",  frequency: "TID", days: "5", instructions: "Cough syrup" },
  { name: "Vitamin C 500mg",   dosage: "500mg", frequency: "OD",  days: "10",instructions: "—" },
];

// ─── Demo steps ────────────────────────────────────────────────────────────────
// Each step has: id, label, duration (ms), description shown in caption
const STEPS = [
  { id: "view",       label: "View Notes",       duration: 5000, caption: "Doctor's notes load for the appointment" },
  { id: "language",   label: "Pick Language",    duration: 4500, caption: "Select Marathi as the output language" },
  { id: "summarize",  label: "Summarize",        duration: 7000, caption: "AI extracts medicines & structured summary" },
  { id: "translate",  label: "Translate",        duration: 6500, caption: "Full note translated to Marathi instantly" },
  { id: "download",   label: "Download PDF",     duration: 5000, caption: "Prescription exported as a PDF" },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ steps, currentStep, progress }) {
  return (
    <div className="flex items-center gap-1.5 px-5 py-3 bg-slate-900 border-b border-slate-700">
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all duration-300 ${
              i < currentStep ? "bg-blue-500 text-white" :
              i === currentStep ? "bg-blue-400 text-white ring-2 ring-blue-300 ring-offset-1 ring-offset-slate-900" :
              "bg-slate-700 text-slate-500"
            }`}>{i < currentStep ? "✓" : i + 1}</div>
            <span className={`text-[10px] truncate hidden sm:block transition-colors ${i === currentStep ? "text-blue-300 font-semibold" : i < currentStep ? "text-slate-400" : "text-slate-600"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-6 h-px bg-slate-700 flex-shrink-0 relative overflow-hidden">
              {i < currentStep && <div className="absolute inset-0 bg-blue-500" />}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function MockBrowser({ children }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-white">
      {/* Browser chrome */}
      <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-slate-700 rounded-md px-3 py-1 text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className="text-green-400">🔒</span>
          medicare.app/patient/notes/APT-2024
        </div>
      </div>
      <div className="bg-gray-50 overflow-hidden" style={{ maxHeight: 380 }}>
        {children}
      </div>
    </div>
  );
}

// ─── STEP SCREENS ──────────────────────────────────────────────────────────────

function StepView({ animIn }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="p-5 space-y-4"
    >
      {/* Page header */}
      <div>
        <div className="h-7 w-40 bg-gray-800 rounded font-bold text-gray-800 flex items-center text-lg px-1">Doctor Notes</div>
        <div className="h-3 w-56 bg-gray-200 rounded mt-1.5" />
      </div>
      {/* Control panel skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex gap-3 mb-3 pb-3 border-b border-gray-100 items-center">
          <div className="h-4 w-4 bg-blue-400 rounded" />
          <div className="h-3 w-28 bg-gray-200 rounded" />
          <div className="h-7 w-32 bg-gray-100 border border-gray-200 rounded-lg ml-2" />
        </div>
        <div className="h-3 w-36 bg-gray-100 rounded mb-2" />
        <div className="grid grid-cols-3 gap-2">
          {["Summarize All","Translate All","Download All PDF"].map(l => (
            <div key={l} className={`h-8 rounded-lg text-[11px] font-medium flex items-center justify-center text-white ${l.includes("Sum") ? "bg-blue-500" : l.includes("Trans") ? "bg-emerald-500" : "bg-indigo-500"}`}>{l}</div>
          ))}
        </div>
      </div>
      {/* Note card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">Note #1</span>
          <span className="text-xs text-gray-400">Today</span>
        </div>
        <div className="p-4">
          <div className="text-center border-b border-gray-200 pb-3 mb-3">
            <div className="text-base font-bold text-blue-700">MEDICARE HOSPITAL</div>
            <div className="text-[10px] text-gray-400 tracking-widest uppercase">AI Assisted Healthcare System</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-[11px] text-gray-700 leading-5 font-mono whitespace-pre-wrap">
            {MOCK_NOTE.slice(0, 180)}…
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StepLanguage() {
  const [selected, setSelected] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSelected(true), 800); return () => clearTimeout(t); }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5">
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <span className="text-blue-500 text-sm">🌐</span>
          <span className="text-sm font-medium text-gray-700">Output language</span>
          <motion.div
            className={`ml-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 border text-sm font-medium transition-all duration-500 ${selected ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}
            animate={selected ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {selected ? "🇮🇳 Marathi" : "🇬🇧 English"}
          </motion.div>
        </div>
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-xs text-gray-500">
              ✅ Language set to <strong>Marathi</strong> — Summarize & Translate will now output in Marathi.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Note preview */}
      <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Prescription</span>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-[11px] text-gray-700 leading-5 font-mono">
          {MOCK_NOTE.slice(0, 140)}…
        </div>
        <div className="flex gap-2 mt-3">
          <div className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg font-medium">Summarize</div>
          <div className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg font-medium">Translate</div>
        </div>
      </div>
    </motion.div>
  );
}

function StepSummarize() {
  const [stage, setStage] = useState(0); // 0=loading, 1=table
  useEffect(() => { const t = setTimeout(() => setStage(1), 3000); return () => clearTimeout(t); }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">Note #1</span>
          <span className="ml-auto text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-medium">🇮🇳 Marathi</span>
        </div>
        <div className="p-4">
          {/* Summarize button with loading → done */}
          <div className="flex gap-2 mb-4">
            <motion.div
              className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg font-medium flex items-center gap-1.5"
              animate={stage === 0 ? { opacity: [1, 0.7, 1] } : {}}
              transition={{ duration: 0.6, repeat: stage === 0 ? Infinity : 0 }}
            >
              {stage === 0 ? <><span className="animate-spin">⏳</span> Summarizing…</> : <>✅ Summarized</>}
            </motion.div>
          </div>

          <AnimatePresence>
            {stage === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                {/* Summary table */}
                <div className="rounded-xl overflow-hidden border border-blue-200">
                  <div className="bg-blue-600 px-3 py-2 flex items-center gap-2">
                    <span className="text-white text-[11px] font-semibold uppercase tracking-widest">📋 Prescription Summary</span>
                  </div>
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-blue-50 text-blue-700 uppercase tracking-wide">
                        {["#","Medicine","Dosage","Freq","Days","Instructions"].map(h => (
                          <th key={h} className="px-2 py-1.5 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_MEDICINES.map((m, i) => (
                        <motion.tr
                          key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`border-t border-blue-100 ${i % 2 === 0 ? "bg-white" : "bg-blue-50/40"}`}
                        >
                          <td className="px-2 py-2 text-gray-400">{i+1}</td>
                          <td className="px-2 py-2 font-semibold text-gray-800">{m.name}</td>
                          <td className="px-2 py-2 text-gray-600">{m.dosage}</td>
                          <td className="px-2 py-2 text-gray-600">{m.frequency}</td>
                          <td className="px-2 py-2 text-gray-600">{m.days}</td>
                          <td className="px-2 py-2 text-gray-500 italic">{m.instructions}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* General note */}
                <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg flex gap-2">
                  <span className="text-amber-500">💡</span>
                  <p className="text-[11px] text-amber-800">विश्रांती घ्या, उबदार द्रव प्या. ५ दिवसांनंतर तक्रार असल्यास पुन्हा भेट द्या.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function StepTranslate() {
  const [stage, setStage] = useState(0);
  useEffect(() => { const t = setTimeout(() => setStage(1), 2500); return () => clearTimeout(t); }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">Note #1</span>
          {stage === 1 && (
            <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="ml-auto text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium"
            >
              🇮🇳 Translated · Marathi
            </motion.span>
          )}
        </div>
        <div className="p-4">
          <div className="flex gap-2 mb-3">
            <motion.div
              className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg font-medium flex items-center gap-1.5"
              animate={stage === 0 ? { opacity: [1, 0.7, 1] } : {}}
              transition={{ duration: 0.6, repeat: stage === 0 ? Infinity : 0 }}
            >
              {stage === 0 ? <><span className="animate-spin">⏳</span> Translating…</> : <>✅ Translated</>}
            </motion.div>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Prescription</span>
            {stage === 1 && <span className="text-[10px] text-emerald-600 font-medium">Translated · Marathi</span>}
          </div>
          <motion.div
            className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-[11px] leading-5 font-mono min-h-[90px]"
            style={{ color: stage === 1 ? "#1f2937" : "#9ca3af" }}
          >
            {stage === 1 ? MOCK_TRANSLATED : MOCK_NOTE.slice(0, 120) + "…"}
          </motion.div>
          {stage === 1 && (
            <motion.details initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
              <summary className="text-[10px] text-gray-400 cursor-pointer hover:text-gray-600">Show original text</summary>
            </motion.details>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StepDownload() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1500);
const t2 = setTimeout(() => setStage(2), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 flex flex-col items-center justify-center min-h-[300px]">
      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div key="idle" className="text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">📄</div>
            <p className="text-sm font-semibold text-gray-700">Generating PDF…</p>
          </motion.div>
        )}
        {stage === 1 && (
          <motion.div key="gen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <motion.div className="text-3xl" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>⏳</motion.div>
            </div>
            <p className="text-sm font-semibold text-gray-700">Capturing prescription…</p>
            <div className="mt-3 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto">
              <motion.div className="h-full bg-indigo-500 rounded-full" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.8 }} />
            </div>
          </motion.div>
        )}
        {stage === 2 && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <motion.div
              className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl"
              animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.4 }}
            >✅</motion.div>
            <p className="text-base font-bold text-gray-800">PDF Downloaded!</p>
            <p className="text-xs text-gray-400 mt-1">All-Prescriptions-APT-2024.pdf</p>
            <div className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg inline-block shadow">
              📥 All-Prescriptions-APT-2024.pdf
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const STEP_SCREENS = [StepView, StepLanguage, StepSummarize, StepTranslate, StepDownload];

// ─── Main Demo Modal ───────────────────────────────────────────────────────────
export default function DemoModal({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [stepProgress, setStepProgress] = useState(0);
  const [stepKey, setStepKey] = useState(0);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);

  const goToStep = (idx) => {
    setCurrentStep(idx);
    setStepProgress(0);
    setStepKey(k => k + 1);
  };

  const reset = () => {
    goToStep(0);
    setPlaying(true);
  };

  // Auto-advance + progress bar
  useEffect(() => {
    if (!playing) { clearInterval(intervalRef.current); clearInterval(progressRef.current); return; }

    const duration = STEPS[currentStep].duration;
    const tick = 30;
    let elapsed = 0;

    progressRef.current = setInterval(() => {
      elapsed += tick;
      setStepProgress(Math.min((elapsed / duration) * 100, 100));
    }, tick);

    intervalRef.current = setTimeout(() => {
      clearInterval(progressRef.current);
      if (currentStep < STEPS.length - 1) {
        goToStep(currentStep + 1);
      } else {
        setPlaying(false);
        setStepProgress(100);
      }
    }, duration);

    return () => { clearTimeout(intervalRef.current); clearInterval(progressRef.current); };
  }, [currentStep, playing]);

  const StepScreen = STEP_SCREENS[currentStep];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#0f172a" }}
        initial={{ scale: 0.93, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 24, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-white font-semibold text-sm">Feature Demo</span>
              <span className="text-slate-500 text-xs">· Doctor Notes AI</span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">{STEPS[currentStep].caption}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlaying(p => !p)}
              className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 transition"
            >
              {playing ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button
              onClick={reset}
              className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 transition"
            >
              <RotateCcw size={13} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-700 hover:bg-red-500 flex items-center justify-center text-slate-300 hover:text-white transition"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Step progress bar */}
        <ProgressBar steps={STEPS} currentStep={currentStep} progress={stepProgress} />

        {/* Current step progress strip */}
        <div className="h-0.5 bg-slate-800">
          <motion.div
            className="h-full bg-blue-400"
            style={{ width: `${stepProgress}%` }}
            transition={{ duration: 0 }}
          />
        </div>

        {/* Screen */}
        <div className="p-4">
          <MockBrowser>
            <AnimatePresence mode="wait">
              <motion.div key={stepKey}>
                <StepScreen />
              </motion.div>
            </AnimatePresence>
          </MockBrowser>
        </div>

        {/* Step dots + label */}
        <div className="flex items-center justify-center gap-2 pb-4">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { goToStep(i); setPlaying(true); }}
              className={`rounded-full transition-all duration-300 ${currentStep === i ? "w-6 h-2 bg-blue-400" : "w-2 h-2 bg-slate-600 hover:bg-slate-500"}`}
              aria-label={s.label}
            />
          ))}
        </div>

        {/* End state CTA */}
        {!playing && currentStep === STEPS.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 pb-5"
          >
            <button onClick={reset} className="px-4 py-2 bg-slate-700 text-slate-200 text-sm rounded-xl hover:bg-slate-600 transition font-medium flex items-center gap-1.5">
              <RotateCcw size={13} /> Replay
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition font-medium">
              Get started →
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}