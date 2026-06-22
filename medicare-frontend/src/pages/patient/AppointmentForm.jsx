import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAllDoctors, bookAppointment } from "../../api/appointments";
import api from "../../api/axiosInstance";

export default function AppointmentForm() {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const { register, handleSubmit, watch, reset } = useForm();

  const selectedDoctor = watch("doctorId");
  const selectedDate = watch("appointmentDate");

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getAllDoctors();
        setDoctors(data);
      } catch (err) {
        toast.error("Failed to fetch doctors");
      }
    };

    fetchDoctors();
  }, []);

  // Fetch slots
  // Fetch slots
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      try {
        const res = await api.get(
          `/appointments/slots?doctorId=${selectedDoctor}&date=${selectedDate}`,
        );

        let availableSlots = res.data;

        // Current date + time
        const now = new Date();

        // Check if selected date is today
        const isToday = selectedDate === now.toISOString().split("T")[0];

        if (isToday) {
          availableSlots = availableSlots.filter((slot) => {
            const [hours, minutes] = slot.split(":");

            const slotTime = new Date();
            slotTime.setHours(parseInt(hours));
            slotTime.setMinutes(parseInt(minutes));
            slotTime.setSeconds(0);

            return slotTime > now;
          });
        }

        setSlots(availableSlots);
      } catch (err) {
        toast.error("Failed to fetch available slots");
      }
    };

    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  // Submit
  const onSubmit = async (data) => {
    try {
      const response = await bookAppointment(data);

      console.log("No-show probability:", response.noShowProbability);
      console.log("Show probability:", response.showProbability);
      console.log("Decision:", response.decision);

      toast.success("Appointment booked successfully!");

      reset();
      setSlots([]);
    } catch (err) {
      if (err.response?.data?.noShowProbability) {
        const risk = Math.round(err.response.data.noShowProbability * 100);

        console.log(
          "No-show probability:",
          err.response.data.noShowProbability,
        );

        toast.warn(`High no-show risk ${err.response.data.suggestion}`);
      } else {
        toast.error(
          err.response?.data?.message || "Failed to book appointment",
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8fb] flex items-center justify-center px-4 py-10">
      <ToastContainer position="top-right" autoClose={3000} />

      <div
        className="
        w-full
        max-w-3xl
        bg-white
        rounded-3xl
        shadow-[0_10px_40px_rgba(15,23,42,0.08)]
        overflow-hidden
        border border-slate-100
      "
      >
        {/* Top Banner */}
        <div
          className="
          bg-gradient-to-r
          from-blue-600
          to-blue-600
          px-8
          py-10
          text-white
        "
        >
          <div className="flex items-center gap-5">
            <div
              className="
              w-20 h-20
              rounded-2xl
              bg-white/20
              backdrop-blur-md
              flex items-center justify-center
              text-4xl
            "
            >
              🩺
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">Book an Appointment</h1>

              <p className="text-cyan-50 mt-2 text-sm">
                Schedule consultations with experienced doctors in a few simple
                steps.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 md:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Doctor */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Select Doctor
              </label>

              <select
                {...register("doctorId")}
                className="
                w-full
                bg-slate-50
                border border-slate-200
                rounded-2xl
                px-5
                py-4
                text-slate-700
                outline-none
                transition-all
                focus:ring-4
                focus:ring-sky-100
                focus:border-sky-400
              "
              >
                <option value="">Choose a doctor</option>

                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.user.name} • {doc.specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Date + Mode */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Appointment Date
                </label>

                <input
                  type="date"
                  {...register("appointmentDate")}
                  className="
                  w-full
                  bg-slate-50
                  border border-slate-200
                  rounded-2xl
                  px-5
                  py-4
                  text-slate-700
                  outline-none
                  transition-all
                  focus:ring-4
                  focus:ring-sky-100
                  focus:border-sky-400
                "
                />
              </div>

              {/* Mode */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Consultation Mode
                </label>

                <select
                  {...register("mode")}
                  className="
                  w-full
                  bg-slate-50
                  border border-slate-200
                  rounded-2xl
                  px-5
                  py-4
                  text-slate-700
                  outline-none
                  transition-all
                  focus:ring-4
                  focus:ring-sky-100
                  focus:border-sky-400
                "
                >
                  <option value="ONLINE">Online Consultation</option>

                  <option value="OFFLINE">Hospital Visit</option>
                </select>
              </div>
            </div>

            {/* Slots */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-slate-700">
                  Available Time Slots
                </label>

                {slots.length > 0 && (
                  <span className="text-sm text-slate-500">
                    {slots.length} slots available
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {slots.length > 0 ? (
                  slots.map((slot) => {
                    const formatTime = (time) => {
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

                    return (
                      <label key={slot} className="cursor-pointer">
                        <input
                          type="radio"
                          value={slot}
                          {...register("startTime")}
                          className="peer hidden"
                        />

                        <div
                          className="
                          text-center
                          py-4
                          rounded-2xl
                          border
                          border-slate-200
                          bg-slate-50
                          text-slate-700
                          font-medium
                          transition-all
                          duration-200
                          hover:border-sky-400
                          hover:bg-sky-50
                          peer-checked:bg-sky-500
                          peer-checked:text-white
                          peer-checked:border-sky-500
                          peer-checked:shadow-lg
                        "
                        >
                          {formatTime(slot)}
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <div
                    className="
                    col-span-full
                    text-center
                    py-10
                    rounded-2xl
                    border border-dashed border-slate-300
                    bg-slate-50
                    text-slate-500
                  "
                  >
                    No available slots for selected date
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="
              w-full
              bg-blue-600
              hover:bg-blue-500
              text-white
              py-4
              rounded-2xl
              font-semibold
              text-lg
              transition-all
              duration-300
              shadow-md
              hover:shadow-lg
            "
            >
              Confirm Appointment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
