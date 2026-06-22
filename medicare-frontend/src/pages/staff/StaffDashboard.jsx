import React from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import StaffAppointments from "./StaffAppointments";

export default function PatientDashboard() {
  return (
    <DashboardLayout role="STAFF">
      <h1 className="text-3xl font-bold mb-8">Staff Dashboard</h1>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Appointments */}
        <StaffAppointments />
      </div>
    </DashboardLayout>
  );
}
