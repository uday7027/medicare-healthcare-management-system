import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TestAI from "./Testai";

export default function App() {
  return (
    <AuthProvider>
      {/* Global Toast container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}      // Duration in ms
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />      
      <AppRoutes />
    </AuthProvider>
  );
}
