import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getStaffProfile, updateStaffProfile } from "../../api/staff";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { User, Mail, Phone, Briefcase, Building2 } from "lucide-react";

export default function StaffProfile() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getStaffProfile();
        reset({
          name: data.user?.name || "",
          email: data.user?.email || "",
          phone: data.user?.phone || "",
          department: data.department || "",
          designation: data.designation || "",
        });
      } catch (err) {
        toast.error("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      await updateStaffProfile(formData);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="STAFF">
      <div className="flex justify-center items-center px-4 py-8">
        <ToastContainer />
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full">
              <User size={38} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Staff Profile
              </h2>
              <p className="text-gray-500 text-sm">
                View and update your staff details
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
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
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
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
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  {...register("phone")}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Department
              </label>
              <div className="relative">
                <Building2
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  {...register("department")}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
                  placeholder="Enter your department"
                />
              </div>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Designation
              </label>
              <div className="relative">
                <Briefcase
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  {...register("designation")}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
                  placeholder="Enter your designation"
                />
              </div>
            </div>

            {/* Update Button */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={loading}
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
