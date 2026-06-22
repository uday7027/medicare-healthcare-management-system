import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axiosInstance";

export default function StaffAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const statuses = ["SCHEDULED", "CHECKED_IN", "COMPLETED", "CANCELLED"];

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/appointments/my");
      setAppointments(res.data);
    } catch (err) {
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      await fetchAppointments();
      toast.success(`Appointment status updated to ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-gray-500 text-lg">Loading appointments...</p>
      </div>
    );

  const statusColors = {
    SCHEDULED: "bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100 hover:shadow-yellow-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 hover:shadow-blue-200",
    CHECKED_IN: "bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100 hover:shadow-indigo-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-300 hover:bg-green-100 hover:shadow-green-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-300 hover:bg-red-100 hover:shadow-red-200",
    NO_SHOW: "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 hover:shadow-gray-200",
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 text-center sm:text-left">
        Manage Appointments
      </h2>

      {appointments.length === 0 ? (
        <p className="text-gray-500 text-center">No appointments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 divide-y divide-gray-200 text-sm sm:text-base">
            <thead className="bg-gray-50">
              <tr>
                {["Patient", "Doctor", "Date", "Time", "Mode", "Status", "Update Status"].map((title) => (
                  <th
                    key={title}
                    className="px-2 sm:px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap">{appt.patient.user.name}</td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap">{appt.doctor.user.name}</td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap">{appt.appointmentDate}</td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap">{appt.startTime} - {appt.endTime}</td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap">{appt.mode}</td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusColors[appt.status]}`}
                    >
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                    <div className="relative inline-block">
                      <select
                        value={appt.status}
                        onChange={(e) => updateStatus(appt.id, e.target.value)}
                        className={`w-36 sm:w-44 border rounded-lg px-3 py-2 text-sm font-medium shadow-sm cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 appearance-none bg-white pr-8 ${statusColors[appt.status]}`}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status} className="font-semibold">
                            {status}
                          </option>
                        ))}
                      </select>

                      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
