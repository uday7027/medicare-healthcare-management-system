import React, { useState } from "react";

import HomeLayout from "../../components/layouts/HomeLayout";

import { useNavigate } from "react-router-dom";

import axios from "axios";

import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";

export default function SelectRole() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [loading, setLoading] = useState(false);

  // Get email from localStorage
  const email = localStorage.getItem("googleEmail");


  const handleSelectRole = async (
  role
) => {

  try {

    setLoading(true);

    // =========================
    // CALL API
    // =========================

    const response = await axios.post(
      "http://localhost:8080/api/auth/select-role",
      {
        email,
        role,
      }
    );

    // =========================
    // BACKEND RESPONSE
    // =========================

    const payload = response.data;

    console.log(
      "SELECT ROLE PAYLOAD:",
      payload
    );

    // =========================
    // SAVE AUTH DATA
    // =========================

    login(payload);

    // Remove temp email
    localStorage.removeItem(
      "googleEmail"
    );

    toast.success(
      `${role} role selected successfully`
    );

    // =========================
    // WAIT SMALL TIME
    // =========================

    setTimeout(() => {

      // Redirect based on role

      if (role === "PATIENT") {

        navigate("/patient");

      }

      else if (role === "DOCTOR") {

        navigate("/doctor");

      }

      else if (role === "STAFF") {

        navigate("/staff");
      }

    }, 300);

  } catch (err) {

    console.error(err);

    toast.error(
      err.response?.data?.message ||
      "Failed to select role"
    );

  } finally {

    setLoading(false);
  }
};

  return (
    <HomeLayout>
      <div
        className="
        min-h-screen
        flex justify-center items-center
        bg-gradient-to-r
        from-blue-50 to-indigo-100
        px-4
      "
      >
        <div
          className="
          bg-white
          rounded-3xl
          shadow-2xl
          p-10
          w-full
          max-w-lg
        "
        >
          <h1
            className="
            text-3xl font-bold
            text-center text-gray-800
            mb-3
          "
          >
            Select Your Role
          </h1>

          <p
            className="
            text-center text-gray-500
            mb-10
          "
          >
            Choose how you want to use Medicare
          </p>

          <div className="space-y-5">
            {/* PATIENT */}

            <button
              disabled={loading}
              onClick={() => handleSelectRole("PATIENT")}
              className="
                w-full
                bg-blue-600
                hover:bg-blue-700
                text-white
                py-4
                rounded-2xl
                text-lg
                font-semibold
                shadow-md
                transition
              "
            >
              Continue as Patient
            </button>

            {/* DOCTOR */}

            <button
              disabled={loading}
              onClick={() => handleSelectRole("DOCTOR")}
              className="
                w-full
                bg-green-600
                hover:bg-green-700
                text-white
                py-4
                rounded-2xl
                text-lg
                font-semibold
                shadow-md
                transition
              "
            >
              Continue as Doctor
            </button>

            {/* STAFF */}

            <button
              disabled={loading}
              onClick={() => handleSelectRole("STAFF")}
              className="
                w-full
                bg-purple-600
                hover:bg-purple-700
                text-white
                py-4
                rounded-2xl
                text-lg
                font-semibold
                shadow-md
                transition
              "
            >
              Continue as Staff
            </button>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
