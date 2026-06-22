import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMyProfile, updateDoctorProfile } from "../../api/doctors";
import DashboardLayout from "../../components/layouts/DashboardLayout";

const daysOfWeek = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export default function DoctorProfile() {
  const { register, handleSubmit, reset, control } = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        reset({
          name: data.user?.name || "",
          email: data.user?.email || "",
          specialty: data.specialty || "",
          qualification: data.qualification || "",
          availableDays: data.availableDays || [],
          startTime: data.startTime || "",
          endTime: data.endTime || "",
        });
      } catch (err) {
        toast.error("Failed to load doctor profile");
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      // Convert times to proper format if needed
      await updateDoctorProfile(formData);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="DOCTOR">
      <ToastContainer />
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <input
              type="text"
              {...register("name")}
              className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              {...register("email")}
              className="w-full border px-3 py-2 rounded-md bg-gray-100 cursor-not-allowed"
              readOnly
            />
          </div>

          {/* Specialty */}
          <div>
            <label className="block mb-1 font-medium">Specialty</label>
            <input
              type="text"
              {...register("specialty")}
              className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Qualification */}
          <div>
            <label className="block mb-1 font-medium">Qualification</label>
            <input
              type="text"
              {...register("qualification")}
              className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Available Days */}
          <div>
            <label className="block mb-1 font-medium">Available Days</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <label key={day} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    value={day}
                    {...register("availableDays")}
                  />
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </label>
              ))}
            </div>
          </div>

          {/* Start Time */}
          <div>
            <label className="block mb-1 font-medium">Start Time</label>
            <input
              type="time"
              {...register("startTime")}
              className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block mb-1 font-medium">End Time</label>
            <input
              type="time"
              {...register("endTime")}
              className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-md transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
