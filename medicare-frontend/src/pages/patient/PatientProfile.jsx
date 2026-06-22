import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import api from "../../api/axiosInstance";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Calendar, UserCircle } from "lucide-react";

export default function PatientProfile() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/patients/me");
        reset({
          name: res.data.user?.name || "",
          email: res.data.user?.email || "",
          phone: res.data.user?.phone || "", // <-- use user.phone
          age: res.data.age || "",
          gender: res.data.gender || "",
          address: res.data.address || "",
        });
      } catch (err) {
        toast.error("Failed to fetch profile details");
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        name: data.name,
        phone: data.phone, // send here to update user.phone
        age: data.age,
        gender: data.gender,
        address: data.address,
      };

      await api.put("/patients/update", payload);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="PATIENT">
      <div className="flex justify-center items-center px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100"
        >
          <ToastContainer />

          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full text-2xl font-bold uppercase">
              <UserCircle size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
              <p className="text-gray-500 text-sm">
                Manage and update your personal information
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  {...register("name")}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  {...register("email")}
                  readOnly
                  className="w-full border border-gray-200 bg-gray-100 rounded-lg pl-10 pr-3 py-2 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  {...register("phone")}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  Age
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />
                  <input
                    type="number"
                    {...register("age")}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
                    placeholder="Enter your age"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-medium">
                  Gender
                </label>
                <select
                  {...register("gender")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Address
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <textarea
                  {...register("address")}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
                  placeholder="Enter your address"
                  rows={3}
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-medium transition-all duration-200 ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-blue-700 hover:shadow-md"
              }`}
            >
              {loading && (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              )}
              {loading ? "Updating..." : "Update Profile"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
