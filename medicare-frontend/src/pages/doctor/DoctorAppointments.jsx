import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  getMyAppointments,
  addAppointmentNote,
  getAppointmentNotes,
  updateAppointmentNote,
  deleteAppointmentNote,
} from "../../api/appointments";
import { transcribeAudio } from "../../api/speech";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { Edit, Save, X, Mic, Square, Trash2 } from "lucide-react";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [notesMap, setNotesMap] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [notes, setNotes] = useState("");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const navigate = useNavigate();

  // ====================================================
  // FETCH NOTES — useCallback to avoid ESLint warning ✅ #7
  // ====================================================
  const fetchNotes = useCallback(async (appointmentId) => {
    try {
      const res = await getAppointmentNotes(appointmentId);
      const fetchedNotes = Array.isArray(res)
        ? res
        : res.data || res.content || [];
      setNotesMap((prev) => ({ ...prev, [appointmentId]: fetchedNotes }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch notes");
    }
  }, []);

  // ====================================================
  // FETCH APPOINTMENTS ✅ #5 loading + #4 empty state
  // ====================================================
  useEffect(() => {
    const fetchAppointments = async () => {
      setFetching(true);
      try {
        const res = await getMyAppointments();
        const appointmentsData = Array.isArray(res)
          ? res
          : res.data || res.content || [];
        setAppointments(appointmentsData);
        appointmentsData.forEach((appt) => fetchNotes(appt.id));
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch appointments");
      } finally {
        setFetching(false);
      }
    };
    fetchAppointments();
  }, [fetchNotes]);

  // ====================================================
  // START RECORDING ✅ #3 mic stream released on stop
  // ====================================================
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        // ✅ #3 — release mic so browser tab red dot goes away
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setLoading(true);
        try {
          const result = await transcribeAudio(audioBlob);
          if (result.text) {
            setNotes((prev) => prev + " " + result.text);
            toast.success("Speech converted!");
          } else {
            toast.error("Transcription failed");
          }
        } catch (error) {
          console.error(error);
          toast.error("Speech conversion failed");
        }
        setLoading(false);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      toast.error("Microphone access denied");
    }
  };

  // ====================================================
  // STOP RECORDING
  // ====================================================
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  // ====================================================
  // START CONSULTATION
  // ====================================================
  const startConsultation = async (appointment) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/appointments/enable-meeting/${appointment.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      navigate(`/video-call/${appointment.meetingRoom}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to start consultation");
    }
  };

  // ====================================================
  // SAVE NOTES
  // ====================================================
  const handleSaveNotes = async (appointmentId) => {
    if (!notes.trim()) {
      toast.error("Note cannot be empty");
      return;
    }
    try {
      if (editingNoteId) {
        await updateAppointmentNote(editingNoteId, notes);
        toast.success("Note updated!");
      } else {
        await addAppointmentNote(appointmentId, notes);
        toast.success("Note saved!");
      }
      await fetchNotes(appointmentId);
      setEditingId(null);
      setEditingNoteId(null);
      setNotes("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save notes");
    }
  };

  // ====================================================
  // DELETE NOTE ✅ #6 confirmation before delete
  // ====================================================
  const handleDeleteNote = async (noteId, appointmentId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteAppointmentNote(noteId);
      toast.success("Note deleted!");
      await fetchNotes(appointmentId);
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  // ====================================================
  // EDIT EXISTING NOTE — pre-fills textarea
  // ====================================================
  const handleEditNote = (note, appointmentId) => {
    setEditingId(appointmentId);
    setEditingNoteId(note.id);
    setNotes(note.noteText);
  };

  // ====================================================
  // CANCEL EDITING
  // ====================================================
  const handleCancelEdit = () => {
    setEditingId(null);
    setNotes("");
    setEditingNoteId(null);
  };
  // ====================================================
  // OPEN NOTES MODAL
  // ====================================================

  const openNotesModal = (appointmentId) => {
    setSelectedNotes(notesMap[appointmentId] || []);
    setShowNotesModal(true);
  };
  // ====================================================
  // STATUS / MODE COLORS
  // ====================================================
  const getStatusColor = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "CHECKED_IN":
        return "bg-indigo-100 text-indigo-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "NO_SHOW":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getModeColor = (mode) =>
    mode?.toUpperCase() === "ONLINE"
      ? "bg-blue-100 text-blue-700"
      : "bg-purple-100 text-purple-700";

  // ====================================================
  // RENDER TABLE BODY ✅ #4 empty state, #5 loading state
  // ====================================================
  const renderTableBody = () => {
    if (fetching) {
      return (
        <tr>
          <td colSpan={7} className="text-center py-12">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <svg
                className="animate-spin h-6 w-6 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              <span className="text-sm">Loading appointments...</span>
            </div>
          </td>
        </tr>
      );
    }

    // ====================================================
    // FILTERED APPOINTMENTS
    // ====================================================

    const filteredAppointments = appointments.filter((appt) => {
      const patientName = appt.patient?.user?.name?.toLowerCase() || "";

      const matchesSearch = patientName.includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || appt.status === statusFilter;

      const matchesMode = modeFilter === "ALL" || appt.mode === modeFilter;

      return matchesSearch && matchesStatus && matchesMode;
    });

    if (filteredAppointments.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="text-center py-12">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm">No appointments found.</span>
            </div>
          </td>
        </tr>
      );
    }

    return filteredAppointments.map((appt) => (
      <tr
        key={appt.id}
        className="border-b align-top hover:bg-gray-50 transition"
      >
        {/* Patient */}
        <td className="px-4 py-3 text-sm">{appt.patient.user.name}</td>

        {/* Date */}
        <td className="px-4 py-3 text-sm">{appt.appointmentDate}</td>

        {/* Time */}
        <td className="px-4 py-3 text-sm">
          {appt.startTime} – {appt.endTime}
        </td>

        {/* Mode */}
        <td className="px-4 py-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getModeColor(appt.mode)}`}
          >
            {appt.mode}
          </span>
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appt.status)}`}
          >
            {appt.status}
          </span>
        </td>

        {/* ====== NOTES COLUMN ====== */}
        {/* ====== NOTES COLUMN ====== */}

        <td className="px-4 py-3 min-w-[220px]">
          {/* Notes Preview */}

          {(notesMap[appt.id] || []).length > 0 ? (
            <div className="space-y-2">
              <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                <p className="text-sm text-green-700 font-medium">
                  Prescription Added
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {(notesMap[appt.id] || []).length} note(s)
                </p>
              </div>

              <button
                onClick={() => openNotesModal(appt.id)}
                className="
          text-blue-600 text-sm
          hover:text-blue-800
          font-medium transition
        "
              >
                View Notes
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No notes added</p>
          )}

          {/* Inline Editor */}

          {editingId === appt.id ? (
            <div className="flex flex-col gap-2 mt-3">
              <textarea
                rows={4}
                className="
          w-full border border-gray-300
          rounded-xl px-3 py-2 text-sm
          resize-none
          focus:outline-none
          focus:ring-2 focus:ring-blue-300
        "
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type or record consultation notes..."
              />

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleSaveNotes(appt.id)}
                  className="
            flex items-center gap-1
            bg-green-600 hover:bg-green-700
            text-white px-3 py-2
            rounded-lg text-sm transition
          "
                >
                  <Save size={14} />
                  Save
                </button>

                <button
                  onClick={handleCancelEdit}
                  className="
            flex items-center gap-1
            bg-gray-500 hover:bg-gray-600
            text-white px-3 py-2
            rounded-lg text-sm transition
          "
                >
                  <X size={14} />
                  Cancel
                </button>

                <button
                  onClick={recording ? stopRecording : startRecording}
                  disabled={loading}
                  className={`
            flex items-center gap-1
            px-3 py-2 rounded-lg
            text-sm text-white transition
            ${
              recording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-600 hover:bg-blue-700"
            }
          `}
                >
                  {recording ? <Square size={14} /> : <Mic size={14} />}

                  {loading ? "Processing..." : recording ? "Stop" : "Record"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditingId(appt.id);
                setNotes("");
                setEditingNoteId(null);
              }}
              className="
        flex items-center gap-1
        text-blue-600 hover:text-blue-800
        text-sm mt-3 transition
      "
            >
              <Edit size={14} />
              Add Note
            </button>
          )}
        </td>

        {/* ====== ACTIONS COLUMN ====== */}
        <td className="px-4 py-3">
          {appt.mode?.toLowerCase() === "online" ? (
            <button
              onClick={() => startConsultation(appt)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition whitespace-nowrap"
            >
              Start Consultation
            </button>
          ) : (
            <span className="text-gray-400 text-sm">In-person</span>
          )}
        </td>
      </tr>
    ));
  };

  // ====================================================
  // JSX
  // ====================================================
  return (
    <div className="">
      <ToastContainer />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6 sm:p-8"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          My Appointments
        </h2>
        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm text-blue-600 font-medium">
              Total Appointments
            </p>

            <h3 className="text-3xl font-bold text-blue-700 mt-2">
              {appointments.length}
            </h3>
          </div>

          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
            <p className="text-sm text-yellow-600 font-medium">Scheduled</p>

            <h3 className="text-3xl font-bold text-yellow-700 mt-2">
              {appointments.filter((a) => a.status === "SCHEDULED").length}
            </h3>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="text-sm text-green-600 font-medium">Completed</p>

            <h3 className="text-3xl font-bold text-green-700 mt-2">
              {appointments.filter((a) => a.status === "COMPLETED").length}
            </h3>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <p className="text-sm text-purple-600 font-medium">
              Online Consultations
            </p>

            <h3 className="text-3xl font-bold text-purple-700 mt-2">
              {appointments.filter((a) => a.mode === "ONLINE").length}
            </h3>
          </div>
        </div>
        {/* SEARCH + FILTERS */}

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}

          <input
            type="text"
            placeholder="Search patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
      flex-1 border border-gray-300
      rounded-xl px-4 py-3
      focus:outline-none
      focus:ring-2 focus:ring-blue-300
    "
          />

          {/* Status Filter */}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="
      border border-gray-300
      rounded-xl px-4 py-3
      focus:outline-none
      focus:ring-2 focus:ring-blue-300
    "
          >
            <option value="ALL">All Status</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Mode Filter */}

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="
      border border-gray-300
      rounded-xl px-4 py-3
      focus:outline-none
      focus:ring-2 focus:ring-blue-300
    "
          >
            <option value="ALL">All Modes</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Patient
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Mode
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Notes
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>{renderTableBody()}</tbody>
          </table>
        </div>
        {/* NOTES MODAL */}

        {showNotesModal && (
          <div
            className="
      fixed inset-0 z-50
      flex items-center justify-center
      bg-black/50 p-4
    "
          >
            <div
              className="
        bg-white rounded-2xl
        shadow-2xl
        max-w-2xl w-full
        max-h-[80vh]
        overflow-y-auto
        p-6
      "
            >
              {/* Header */}

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Consultation Notes
                </h2>

                <button
                  onClick={() => setShowNotesModal(false)}
                  className="
            text-gray-500 hover:text-gray-700
            text-xl font-bold
          "
                >
                  ✕
                </button>
              </div>

              {/* Notes List */}

              <div className="space-y-4">
                {selectedNotes.length > 0 ? (
                  selectedNotes.map((note) => {
                    // Find which appointment this note belongs to
                    const appointmentId = appointments.find((appt) =>
                      (notesMap[appt.id] || []).some((n) => n.id === note.id),
                    )?.id;

                    return (
                      <div
                        key={note.id}
                        className="
            border border-gray-200
            rounded-xl p-4
            bg-gray-50
          "
                      >
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {note.noteText}
                        </p>

                        <div className="flex justify-end mt-4 gap-2">
                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => {
                              handleEditNote(note, appointmentId);
                              setShowNotesModal(false);
                            }}
                            className="
                text-blue-600 hover:text-blue-800
                text-sm font-medium
              "
                          >
                            Edit
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            onClick={() => {
                              handleDeleteNote(note.id, appointmentId);
                            }}
                            className="
                text-red-500 hover:text-red-700
                text-sm font-medium
              "
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500">No notes available.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
