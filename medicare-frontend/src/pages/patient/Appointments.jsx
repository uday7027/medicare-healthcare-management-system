import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { toast, ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import {
  getMyAppointments,
  deleteAppointment,
} from "../../api/appointments";

import {
  CalendarDays,
  Stethoscope,
  Video,
  User,
  Trash2,
} from "lucide-react";

export default function Appointments() {

  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);

  // ====================================================
  // FORMAT TIME TO 12 HOUR
  // ====================================================

  const formatTo12Hour = (time) => {

    if (!time) return "";

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(hours);
    date.setMinutes(minutes);

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ====================================================
  // FETCH APPOINTMENTS
  // ====================================================

  const fetchAppointments = async () => {

    try {

      const res = await getMyAppointments();

      console.log(res);

      if (Array.isArray(res)) {

        setAppointments(res);

      } else if (Array.isArray(res.data)) {

        setAppointments(res.data);

      } else {

        setAppointments([]);
      }

    } catch (err) {

      toast.error("Failed to fetch appointments");

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchAppointments();

  }, []);

  // ====================================================
  // STATUS BADGE
  // ====================================================

  const getStatusBadge = (status) => {

    const colors = {

      SCHEDULED:
        "bg-yellow-100 text-yellow-800",

      CHECKED_IN:
        "bg-indigo-100 text-indigo-800",

      COMPLETED:
        "bg-green-100 text-green-800",

      CANCELLED:
        "bg-red-100 text-red-800",
    };

    return (

      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          colors[status] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  // ====================================================
  // JOIN CONSULTATION
  // ====================================================

  const joinConsultation = (appointment) => {

  console.log("Appointment:", appointment);
  console.log("Meeting Room:", appointment.meetingRoom);

  navigate(`/video-call/${appointment.meetingRoom}`);
};

  // ====================================================
  // DELETE / CANCEL APPOINTMENT
  // ====================================================

  const handleDelete = async (appointmentId) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmDelete) return;

    try {

      await deleteAppointment(appointmentId);

      toast.success(
        "Appointment cancelled successfully"
      );

      // REFRESH LIST
      fetchAppointments();

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to cancel appointment"
      );
    }
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading)

    return (

      <div className="flex justify-center items-center min-h-[200px]">

        <p className="text-gray-500 text-lg animate-pulse">
          Loading appointments...
        </p>

      </div>
    );

  // ====================================================
  // EMPTY
  // ====================================================

  if (appointments.length === 0)

    return (

      <div className="flex justify-center items-center min-h-[200px]">

        <p className="text-gray-500 text-lg">
          No appointments found.
        </p>

      </div>
    );

  // ====================================================
  // UI
  // ====================================================

  return (

    <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-100">

      <ToastContainer />

      <div className="flex items-center gap-2 mb-5">

        <CalendarDays className="w-6 h-6 text-blue-600" />

        <h2 className="text-2xl font-bold text-gray-800">
          My Appointments
        </h2>

      </div>

      {/* ==================================================== */}
      {/* DESKTOP VIEW */}
      {/* ==================================================== */}

      <div className="hidden md:block overflow-x-auto">

        <table className="min-w-full border border-gray-100 rounded-lg overflow-hidden">

          <thead className="bg-gray-50 text-gray-700 uppercase text-sm">

            <tr>

              <th className="py-3 px-5 text-left border-b">
                Doctor
              </th>

              <th className="py-3 px-5 text-left border-b">
                Specialty
              </th>

              <th className="py-3 px-5 text-left border-b">
                Date
              </th>

              <th className="py-3 px-5 text-left border-b">
                Time
              </th>

              <th className="py-3 px-5 text-left border-b">
                Mode
              </th>

              <th className="py-3 px-5 text-left border-b">
                Status
              </th>

              <th className="py-3 px-5 text-left border-b">
                Actions
              </th>

            </tr>

          </thead>

          <tbody className="divide-y divide-gray-100">

            {appointments.map((appt) => (

              <tr
                key={appt.id}
                className="hover:bg-blue-50 transition-all duration-200"
              >

                <td className="py-3 px-5 flex items-center gap-2">

                  <User className="w-4 h-4 text-blue-500" />

                  {appt.doctor.user.name}

                </td>

                <td className="py-3 px-5 text-gray-700">

                  {appt.doctor.specialty}

                </td>

                <td className="py-3 px-5 text-gray-600">

                  {appt.appointmentDate}

                </td>

                <td className="py-3 px-5 text-gray-600">

                  {formatTo12Hour(appt.startTime)}
                  {" - "}
                  {formatTo12Hour(appt.endTime)}

                </td>

                <td className="py-3 px-5 flex items-center gap-1 text-gray-700">

                  {appt.mode.toUpperCase() === "ONLINE" ? (

                    <Video className="w-4 h-4 text-indigo-500" />

                  ) : (

                    <Stethoscope className="w-4 h-4 text-green-500" />

                  )}

                  {appt.mode}

                </td>

                <td className="py-3 px-5">

                  {getStatusBadge(appt.status)}

                </td>

                <td className="py-3 px-5">

                  <div className="flex flex-col gap-2">

                    {/* VIEW NOTES */}
                    <button
                      onClick={() =>
                        navigate(`/patient-notes/${appt.id}`, {
                          state: {
                            appointment: appt,
                          },
                        })
                      }
                      className="
                        bg-blue-500 hover:bg-blue-600
                        text-white px-4 py-2 rounded-lg
                        transition-all duration-200
                      "
                    >
                      View Notes
                    </button>

                    {/* JOIN CONSULTATION */}
                    {
                      appt.mode?.toUpperCase() === "ONLINE"
                      &&
                      appt.meetingEnabled === true
                      &&
                      (
                        <button
                          onClick={() =>
                            joinConsultation(appt)
                          }
                          className="
                            bg-green-600 hover:bg-green-700
                            text-white px-4 py-2 rounded-lg
                            transition-all duration-200
                          "
                        >
                          Join Consultation
                        </button>
                      )
                    }

                    {/* WAITING */}
                    {
                      appt.mode?.toUpperCase() === "ONLINE"
                      &&
                      !appt.meetingEnabled
                      &&
                      (
                        <span className="text-sm text-gray-500">
                          Waiting for doctor...
                        </span>
                      )
                    }

                    {/* DELETE BUTTON */}
                    {
                      appt.status !== "COMPLETED"
                      &&
                      appt.status !== "CANCELLED"
                      &&
                      (
                        <button
                          onClick={() =>
                            handleDelete(appt.id)
                          }
                          className="
                            bg-red-50 hover:bg-red-100
                            text-red-600 border border-red-200
                            px-4 py-2 rounded-lg
                            transition-all duration-200
                            flex items-center justify-center gap-2
                          "
                        >
                          <Trash2 size={16} />
                          Cancel Appointment
                        </button>
                      )
                    }

                  </div>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* ==================================================== */}
      {/* MOBILE VIEW */}
      {/* ==================================================== */}

      <div className="md:hidden flex flex-col gap-4">

        {appointments.map((appt) => (

          <div
            key={appt.id}
            className="
              p-4 rounded-xl border border-gray-100
              shadow-sm bg-gray-50
              hover:shadow-md transition-all
            "
          >

            <div className="flex justify-between items-center mb-2">

              <h3 className="font-semibold text-gray-800 flex items-center gap-2">

                <User className="w-4 h-4 text-blue-500" />

                {appt.doctor.user.name}

              </h3>

              {getStatusBadge(appt.status)}

            </div>

            <p className="text-gray-600 text-sm">

              Specialty:
              {" "}

              <span className="font-medium">
                {appt.doctor.specialty}
              </span>

            </p>

            <p className="text-gray-600 text-sm">

              Date:
              {" "}

              <span className="font-medium">
                {appt.appointmentDate}
              </span>

            </p>

            <p className="text-gray-600 text-sm">

              Time:
              {" "}

              <span className="font-medium">

                {formatTo12Hour(appt.startTime)}
                {" - "}
                {formatTo12Hour(appt.endTime)}

              </span>

            </p>

            <p className="text-gray-600 text-sm flex items-center gap-1">

              Mode:
              {" "}

              {
                appt.mode.toUpperCase() === "ONLINE"
                ? (
                    <Video className="w-4 h-4 text-indigo-500" />
                  )
                : (
                    <Stethoscope className="w-4 h-4 text-green-500" />
                  )
              }

              <span className="font-medium">
                {appt.mode}
              </span>

            </p>

            <div className="mt-4 flex flex-col gap-2">

              {/* VIEW NOTES */}
              <button
                onClick={() =>
                  navigate(`/patient-notes/${appt.id}`, {
                    state: {
                      appointment: appt,
                    },
                  })
                }
                className="
                  bg-blue-500 hover:bg-blue-600
                  text-white px-4 py-2 rounded-lg
                  w-full transition-all duration-200
                "
              >
                View Notes
              </button>

              {/* JOIN CONSULTATION */}
              {
                appt.mode?.toUpperCase() === "ONLINE"
                &&
                appt.meetingEnabled === true
                &&
                (
                  <button
                    onClick={() =>
                      joinConsultation(appt)
                    }
                    className="
                      bg-green-600 hover:bg-green-700
                      text-white px-4 py-2 rounded-lg
                      w-full transition-all duration-200
                    "
                  >
                    Join Consultation
                  </button>
                )
              }

              {/* WAITING */}
              {
                appt.mode?.toUpperCase() === "ONLINE"
                &&
                !appt.meetingEnabled
                &&
                (
                  <span className="text-sm text-gray-500">
                    Waiting for doctor...
                  </span>
                )
              }

              {/* DELETE BUTTON */}
              {
                appt.status !== "COMPLETED"
                &&
                appt.status !== "CANCELLED"
                &&
                (
                  <button
                    onClick={() =>
                      handleDelete(appt.id)
                    }
                    className="
                      bg-red-50 hover:bg-red-100
                      text-red-600 border border-red-200
                      px-4 py-2 rounded-lg
                      w-full transition-all duration-200
                      flex items-center justify-center gap-2
                    "
                  >
                    <Trash2 size={16} />
                    Cancel Appointment
                  </button>
                )
              }

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}