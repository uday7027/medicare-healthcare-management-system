import React, { useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import AppointmentForm from "./AppointmentForm";
import Appointments from "./Appointments";

export default function PatientDashboard() {
  const [showForm, setShowForm] = useState(false);

  return (
    <DashboardLayout role="PATIENT">
      <div className="flex flex-col gap-6"> 
        <h1 className="text-3xl font-bold">Patient Dashboard</h1>

        {/* Toggle Button for Appointment Form */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="self-start bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          {showForm ? "Hide Appointment Form" : "Book Appointment"}
        </button>

        {/* Appointment Form */}
        {showForm && <AppointmentForm />}

        {/* Appointments & Records */}
        <div className="flex flex-col gap-6">
          <Appointments />
        </div>
      </div>
    </DashboardLayout>
  );
}
