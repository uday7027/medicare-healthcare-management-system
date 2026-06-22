import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../pages/home/Home";
import Features from "../pages/home/Features";
import About from "../pages/home/About";
import Contact from "../pages/home/Contact";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyOtp from "../pages/auth/VerifyOtp";

import NotFound from "../pages/NotFound";

import ProtectedRoute from "../components/ProtectedRoute";

// Patient Pages
import PatientDashboard from "../pages/patient/PatientDashboard";
import PatientProfile from "../pages/patient/PatientProfile";
import PatientNotes from "../pages/patient/PatientNotes";

// Doctor Pages
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import DoctorProfile from "../pages/doctor/DoctorProfile";
import VideoCall from "../pages/doctor/VideoCall";

// Staff Pages
import StaffDashboard from "../pages/staff/StaffDashboard";
import StaffProfile from "../pages/staff/StaffProfile";

import SelectRole from "../pages/auth/SelectRole";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ===================================== */}
      {/* PUBLIC ROUTES */}
      {/* ===================================== */}

      <Route path="/" element={<Home />} />

      <Route path="/features" element={<Features />} />

      <Route path="/about" element={<About />} />

      <Route path="/contact" element={<Contact />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/verify-otp" element={<VerifyOtp />} />

      <Route path="/select-role" element={<SelectRole />} />

      {/* ===================================== */}
      {/* PATIENT ROUTES */}
      {/* ===================================== */}

      <Route element={<ProtectedRoute roles={["PATIENT"]} />}>
        <Route path="/patient" element={<PatientDashboard />} />

        <Route
          path="/patient/profile"
          element={<PatientProfile />}
        />

        <Route
          path="/patient-notes/:id"
          element={<PatientNotes />}
        />
      </Route>

      {/* ===================================== */}
      {/* DOCTOR ROUTES */}
      {/* ===================================== */}

      <Route element={<ProtectedRoute roles={["DOCTOR"]} />}>
        <Route path="/doctor" element={<DoctorDashboard />} />

        <Route
          path="/doctor/profile"
          element={<DoctorProfile />}
        />
      </Route>

      {/* ===================================== */}
      {/* VIDEO CALL ROUTE */}
      {/* BOTH DOCTOR + PATIENT */}
      {/* ===================================== */}

      <Route
        element={
          <ProtectedRoute
            roles={["DOCTOR", "PATIENT"]}
          />
        }
      >
        <Route
          path="/video-call/:roomName"
          element={<VideoCall />}
        />
      </Route>

      {/* ===================================== */}
      {/* STAFF ROUTES */}
      {/* ===================================== */}

      <Route element={<ProtectedRoute roles={["STAFF"]} />}>
        <Route path="/staff" element={<StaffDashboard />} />

        <Route
          path="/staff/profile"
          element={<StaffProfile />}
        />
      </Route>

      {/* ===================================== */}
      {/* FALLBACK ROUTE */}
      {/* ===================================== */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}