import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getAppointmentNotes } from "../../api/appointments";
import { summarizeNotes, translateNotes } from "../../api/ai";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  FileText,
  Languages,
  ChevronDown,
  Loader2,
  ClipboardList,
  FolderDown,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "mr", label: "Marathi", flag: "🇮🇳" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "ta", label: "Tamil", flag: "🇮🇳" },
  { code: "te", label: "Telugu", flag: "🇮🇳" },
  { code: "kn", label: "Kannada", flag: "🇮🇳" },
  { code: "ml", label: "Malayalam", flag: "🇮🇳" },
  { code: "gu", label: "Gujarati", flag: "🇮🇳" },
  { code: "bn", label: "Bengali", flag: "🇮🇳" },
  { code: "pa", label: "Punjabi", flag: "🇮🇳" },
  { code: "ur", label: "Urdu", flag: "🇵🇰" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
];

// ── Pill badge ────────────────────────────────────────────────────────────────
const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}
    >
      {children}
    </span>
  );
};

// ── Action button ─────────────────────────────────────────────────────────────
const ActionButton = ({
  onClick,
  disabled,
  loading,
  icon: Icon,
  label,
  color,
  fullWidth = false,
}) => {
  const colors = {
    blue: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300",
    green: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300",
    indigo: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${colors[color]} ${fullWidth ? "w-full" : ""}`}
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Icon size={15} />
      )}
      {label}
    </button>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export default function PatientNotes() {
  const { id } = useParams();
  const location = useLocation();
  const appointment = location.state?.appointment;
  const prescriptionRefs = useRef({});

  const [notes, setNotes] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [summaryMap, setSummaryMap] = useState({});
  const [translationMap, setTranslationMap] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const [loadingSummaryId, setLoadingSummaryId] = useState(null);
  const [loadingTranslationId, setLoadingTranslationId] = useState(null);
  const [bulkSummarizing, setBulkSummarizing] = useState(false);
  const [bulkTranslating, setBulkTranslating] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // ── Fetch notes ───────────────────────────────────────────────────────────
  const fetchNotes = useCallback(async () => {
    setFetching(true);
    try {
      const res = await getAppointmentNotes(id);
      const data = Array.isArray(res) ? res : res.data || res.content || [];
      setNotes(data.filter((n) => n.noteText?.trim()));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch notes");
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // ── Translate medicine fields helper ─────────────────────────────────────
  const translateMedicines = async (medicines, language) => {
    return Promise.all(
      medicines.map(async (med) => {
        const [name, dosage, frequency, days, instructions] = await Promise.all(
          [
            med.name
              ? translateNotes(med.name, language).then((r) => r.translatedText)
              : Promise.resolve(""),
            med.dosage
              ? translateNotes(med.dosage, language).then(
                  (r) => r.translatedText,
                )
              : Promise.resolve(""),
            med.frequency
              ? translateNotes(med.frequency, language).then(
                  (r) => r.translatedText,
                )
              : Promise.resolve(""),
            med.days
              ? translateNotes(med.days, language).then((r) => r.translatedText)
              : Promise.resolve(""),
            med.instructions
              ? translateNotes(med.instructions, language).then(
                  (r) => r.translatedText,
                )
              : Promise.resolve(""),
          ],
        );
        return { name, dosage, frequency, days, instructions };
      }),
    );
  };

  // ── Single note: Summarize ────────────────────────────────────────────────
  const handleSummarize = async (note) => {
    setLoadingSummaryId(note.id);
    try {
      const result = await summarizeNotes(note.noteText);
      let medicines = result.medicines || [];
      let generalNote = result.generalNote || "";

      if (selectedLanguage && selectedLanguage !== "en") {
        if (generalNote) {
          const t = await translateNotes(generalNote, selectedLanguage);
          generalNote = t.translatedText;
        }
        medicines = await translateMedicines(medicines, selectedLanguage);
      }

      setSummaryMap((prev) => ({
        ...prev,
        [note.id]: { medicines, generalNote },
      }));
      toast.success("Summary ready!");
    } catch (error) {
      console.error(error);
      toast.error("Summary failed");
    } finally {
      setLoadingSummaryId(null);
    }
  };

  // ── Single note: Translate ────────────────────────────────────────────────
  const handleTranslate = async (note) => {
    if (selectedLanguage === "en") {
      toast.info("Select a language other than English to translate.");
      return;
    }
    setLoadingTranslationId(note.id);
    try {
      const result = await translateNotes(note.noteText, selectedLanguage);
      setTranslationMap((prev) => ({
        ...prev,
        [note.id]: result.translatedText,
      }));
      toast.success("Translation applied to prescription!");
    } catch (error) {
      console.error(error);
      toast.error("Translation failed");
    } finally {
      setLoadingTranslationId(null);
    }
  };

  // ── BULK: Summarize all ───────────────────────────────────────────────────
  const handleBulkSummarize = async () => {
    setBulkSummarizing(true);
    toast.info(`Summarizing ${notes.length} notes...`);
    try {
      const results = await Promise.all(
        notes.map(async (note) => {
          const result = await summarizeNotes(note.noteText);
          let medicines = result.medicines || [];
          let generalNote = result.generalNote || "";

          if (selectedLanguage && selectedLanguage !== "en") {
            if (generalNote) {
              const t = await translateNotes(generalNote, selectedLanguage);
              generalNote = t.translatedText;
            }
            medicines = await translateMedicines(medicines, selectedLanguage);
          }

          return { id: note.id, summary: { medicines, generalNote } };
        }),
      );
      const newMap = {};
      results.forEach(({ id, summary }) => {
        newMap[id] = summary;
      });
      setSummaryMap((prev) => ({ ...prev, ...newMap }));
      toast.success(`All ${notes.length} notes summarized!`);
    } catch (error) {
      console.error(error);
      toast.error("Bulk summarize failed");
    } finally {
      setBulkSummarizing(false);
    }
  };

  // ── BULK: Translate all ───────────────────────────────────────────────────
  const handleBulkTranslate = async () => {
    if (selectedLanguage === "en") {
      toast.info("Select a language other than English to translate.");
      return;
    }
    setBulkTranslating(true);
    toast.info(`Translating ${notes.length} notes...`);
    try {
      const results = await Promise.all(
        notes.map(async (note) => {
          const result = await translateNotes(note.noteText, selectedLanguage);
          return { id: note.id, translatedText: result.translatedText };
        }),
      );
      const newMap = {};
      results.forEach(({ id, translatedText }) => {
        newMap[id] = translatedText;
      });
      setTranslationMap((prev) => ({ ...prev, ...newMap }));
      toast.success(`All ${notes.length} notes translated!`);
    } catch (error) {
      console.error(error);
      toast.error("Bulk translate failed");
    } finally {
      setBulkTranslating(false);
    }
  };

  // ── Download ALL notes as single PDF ──────────────────────────────────────
  const downloadAllPDF = async () => {
    if (notes.length === 0) return;

    setDownloadingAll(true);
    setIsGeneratingPDF(true);

    toast.info("Generating combined PDF...");

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const pageHeight = 297;

      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        const input = prescriptionRefs.current[note.id];

        if (!input) continue;

        const canvas = await html2canvas(input, {
          scale: 2,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) pdf.addPage();

        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);

        // Footer line
        pdf.setDrawColor(220);
        pdf.line(10, 280, 200, 280);

        // Doctor signature
        pdf.setFontSize(10);
        pdf.setTextColor(80);

        pdf.text("Doctor Signature", 10, 287);

        // Signature line
        pdf.line(10, 289, 60, 289);

        // Doctor name
        pdf.setFontSize(11);
        pdf.text(`Dr. ${appointment?.doctor?.user?.name || ""}`, 10, 295);

        // Generated by
        pdf.setFontSize(9);
        pdf.setTextColor(120);

        pdf.text("Generated by", 150, 287);

        pdf.setFontSize(10);
        pdf.setTextColor(0, 102, 204);

        pdf.text("Medicare AI Platform", 150, 293);

        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      pdf.save(`All-Prescriptions-${id}.pdf`);

      toast.success("All prescriptions downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("Combined PDF download failed");
    } finally {
      setDownloadingAll(false);
      setIsGeneratingPDF(false);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mb-8" />
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 animate-pulse"
            >
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-3" />
              <div className="h-4 w-1/2 bg-gray-100 rounded mb-3" />
              <div className="h-24 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!fetching && notes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <ClipboardList className="mx-auto mb-4 text-gray-300" size={56} />
          <h2 className="text-xl font-semibold text-gray-700 mb-1">
            No notes yet
          </h2>
          <p className="text-sm text-gray-400">
            The doctor hasn't added any notes for this appointment.
          </p>
        </div>
      </div>
    );
  }

  const isBulkBusy = bulkSummarizing || bulkTranslating || downloadingAll;

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Doctor Notes
          </h1>
          {appointment && (
            <p className="mt-1 text-sm text-gray-500">
              Appointment on{" "}
              <span className="font-medium text-gray-700">
                {appointment.appointmentDate}
              </span>{" "}
              with{" "}
              <span className="font-medium text-gray-700">
                Dr. {appointment.doctor?.user?.name}
              </span>
            </p>
          )}
        </motion.div>

        {/* Control panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-2xl px-5 py-4 mb-6 shadow-sm"
        >
          {/* Language row */}
          <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Languages size={16} className="text-blue-500" />
              Output language
            </div>
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            <p className="text-xs text-gray-400 ml-auto hidden sm:block">
              Applies to Summarize &amp; Translate
            </p>
          </div>

          {/* Bulk actions */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Bulk actions — applies to all {notes.length} notes at once
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <ActionButton
                onClick={handleBulkSummarize}
                disabled={isBulkBusy}
                loading={bulkSummarizing}
                icon={FileText}
                label={bulkSummarizing ? "Summarizing all..." : "Summarize All"}
                color="blue"
                fullWidth
              />
              <ActionButton
                onClick={handleBulkTranslate}
                disabled={isBulkBusy}
                loading={bulkTranslating}
                icon={Languages}
                label={bulkTranslating ? "Translating all..." : "Translate All"}
                color="green"
                fullWidth
              />
              <ActionButton
                onClick={downloadAllPDF}
                disabled={isBulkBusy}
                loading={downloadingAll}
                icon={FolderDown}
                label={
                  downloadingAll ? "Generating PDF..." : "Download All PDF"
                }
                color="indigo"
                fullWidth
              />
            </div>
          </div>
        </motion.div>

        {/* Notes list */}
        <div className="space-y-6">
          {notes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Note header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
                <Badge color="blue">Note #{index + 1}</Badge>
                <div className="flex items-center gap-3">
                  {translationMap[note.id] && (
                    <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                      {LANGUAGES.find((l) => l.code === selectedLanguage)?.flag}{" "}
                      {
                        LANGUAGES.find((l) => l.code === selectedLanguage)
                          ?.label
                      }
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {note.createdAt
                      ? new Date(note.createdAt).toLocaleDateString()
                      : "Date not available"}
                  </span>
                </div>
              </div>

              {/* ✅ ref now wraps prescription + summary table together */}
              <div
                ref={(el) => (prescriptionRefs.current[note.id] = el)}
                className="bg-white p-6"
              >
                {/* Hospital header */}
                <div className="text-center border-b border-gray-200 pb-5 mb-5">
                  <h2 className="text-2xl font-bold text-blue-700 tracking-tight">
                    MEDICARE HOSPITAL
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 tracking-widest uppercase">
                    AI Assisted Healthcare System
                  </p>
                </div>

                {/* Appointment meta */}
                {appointment && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    {[
                      {
                        label: "Doctor",
                        value: `Dr. ${appointment.doctor?.user?.name ?? "—"}`,
                      },
                      {
                        label: "Patient",
                        value: appointment.patient?.user?.name ?? "—",
                      },
                      {
                        label: "Date",
                        value: appointment.appointmentDate ?? "—",
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
                      >
                        <p className="text-xs text-gray-400 mb-0.5 uppercase tracking-wide">
                          {label}
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Prescription body */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                      Prescription
                    </p>
                    {translationMap[note.id] && (
                      <span className="text-xs text-emerald-600 font-medium">
                        Translated ·{" "}
                        {
                          LANGUAGES.find((l) => l.code === selectedLanguage)
                            ?.label
                        }
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm leading-7 text-gray-700 whitespace-pre-wrap min-h-[80px]">
                    {translationMap[note.id] || note.noteText}
                  </div>

                  {translationMap[note.id] && !isGeneratingPDF && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-400 cursor-pointer select-none hover:text-gray-600 transition">
                        Show original text
                      </summary>

                      <p className="mt-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-3 leading-6">
                        {note.noteText}
                      </p>
                    </details>
                  )}
                </div>

                {/* Footer signature */}
                {/* <div className="flex justify-between items-end pt-6 mt-6 border-t border-dashed border-gray-200">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-6">
                      Doctor's Signature
                    </p>
                    <p className="font-signature text-lg text-gray-700 italic">
                      Dr. {appointment.doctor?.user?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Generated by</p>
                    <p className="text-xs font-semibold text-blue-600">
                      Medicare AI Platform
                    </p>
                  </div>
                </div> */}

                {/* ✅ Summary table inside ref — captured in PDF */}
                {summaryMap[note.id] && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    {/* Summary header */}
                    <div className="bg-blue-600 px-4 py-3 flex items-center gap-2 rounded-t-xl">
                      <FileText size={15} className="text-white" />
                      <p className="text-xs font-semibold uppercase tracking-widest text-white">
                        Prescription Summary
                      </p>
                    </div>

                    {/* Medicine table */}
                    {summaryMap[note.id].medicines.length > 0 ? (
                      <div className="overflow-x-auto border border-blue-200 border-t-0 rounded-b-xl">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-blue-50 text-blue-700 text-xs uppercase tracking-wide">
                              <th className="px-4 py-2 text-left font-semibold">
                                #
                              </th>
                              <th className="px-4 py-2 text-left font-semibold">
                                Medicine
                              </th>
                              <th className="px-4 py-2 text-left font-semibold">
                                Dosage
                              </th>
                              <th className="px-4 py-2 text-left font-semibold">
                                Frequency
                              </th>
                              <th className="px-4 py-2 text-left font-semibold">
                                Days
                              </th>
                              <th className="px-4 py-2 text-left font-semibold">
                                Instructions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {summaryMap[note.id].medicines.map((med, i) => (
                              <tr
                                key={i}
                                className={`border-t border-blue-100 ${
                                  i % 2 === 0 ? "bg-white" : "bg-blue-50/40"
                                }`}
                              >
                                <td className="px-4 py-3 text-gray-400 text-xs">
                                  {i + 1}
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-800">
                                  {med.name || "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {med.dosage || "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {med.frequency || "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {med.days || "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs italic">
                                  {med.instructions || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-400 italic border border-blue-200 border-t-0 rounded-b-xl">
                        No medicines found in this note.
                      </div>
                    )}

                    {/* General advice */}
                    {summaryMap[note.id].generalNote && (
                      <div className="mt-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-2 items-start">
                        <span className="text-amber-500 shrink-0 mt-0.5">
                          💡
                        </span>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          {summaryMap[note.id].generalNote}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Per-note action bar — no summary card here anymore */}
              <div className="px-6 pb-6 pt-3 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-400 mb-2 font-medium">
                  Actions for this note
                </p>
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    onClick={() => handleSummarize(note)}
                    disabled={
                      loadingSummaryId === note.id ||
                      loadingTranslationId === note.id ||
                      isBulkBusy
                    }
                    loading={loadingSummaryId === note.id}
                    icon={FileText}
                    label={
                      loadingSummaryId === note.id
                        ? "Summarizing..."
                        : "Summarize"
                    }
                    color="blue"
                  />
                  <ActionButton
                    onClick={() => handleTranslate(note)}
                    disabled={
                      loadingTranslationId === note.id ||
                      loadingSummaryId === note.id ||
                      isBulkBusy
                    }
                    loading={loadingTranslationId === note.id}
                    icon={Languages}
                    label={
                      loadingTranslationId === note.id
                        ? "Translating..."
                        : "Translate"
                    }
                    color="green"
                  />
                  {translationMap[note.id] && (
                    <button
                      onClick={() =>
                        setTranslationMap((prev) => {
                          const next = { ...prev };
                          delete next[note.id];
                          return next;
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-100 transition"
                    >
                      Reset to original
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
