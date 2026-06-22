import React from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import DoctorAppointments from "./DoctorAppointments";

export default function Dashboard() {
  return (
    <DashboardLayout role="DOCTOR">
      <h1 className="text-3xl font-bold mb-8">Doctor Dashboard</h1>

      
      {/* Doctor Appointments */}
      <div className="mb-8">
        <DoctorAppointments />
      </div>
    </DashboardLayout>
  );
}
