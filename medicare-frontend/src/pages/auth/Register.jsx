import React from "react";
import HomeLayout from "../../components/layouts/HomeLayout";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerUser } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";

import axios from "axios";

// Validation schema
// Validation schema
const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters"),

  email: yup
    .string()
    .trim()
    .email("Enter a valid email address")
    .test("valid-domain", "Please enter a real email address", (value) => {
      if (!value) return false;

      // Block fake/test domains
      const blockedDomains = [
        "example.com",
        "test.com",
        "mailinator.com",
        "fake.com",
        "tempmail.com",
        "dummy.com",
      ];

      const domain = value.split("@")[1]?.toLowerCase();

      return domain && !blockedDomains.includes(domain);
    })
    .required("Email is required"),

  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number"),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Password must contain uppercase, lowercase, number and special character",
    ),

  role: yup
    .string()
    .oneOf(["PATIENT", "DOCTOR", "STAFF"])
    .required("Role is required"),
});

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await registerUser(data);

      toast.success("OTP sent to your email");

      // Store email for OTP page
      localStorage.setItem("verifyEmail", data.email);

      // Clear form
      setValue("name", "");
      setValue("email", "");
      setValue("phone", "");
      setValue("password", "");
      setValue("role", "");

      // Navigate to OTP page
      navigate("/verify-otp");
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Please verify email on login page";

      // If user exists but not verified
      if (message.includes("not verified")) {
        toast.success(message);

        // Store email
        localStorage.setItem("verifyEmail", data.email);

        // Redirect to OTP page
        navigate("/verify-otp");

        return;
      }

      toast.error(message);
    }
  };
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/google",
        {
          token: credentialResponse.credential,
        },
      );

      const payload = response.data;

      // If role selection required

      if (payload.needsRoleSelection) {
        localStorage.setItem("googleEmail", payload.user.email);

        navigate("/select-role");

        return;
      }

      // Existing user

      login(payload);

      toast.success("Google Login Successful");

      const role = payload.user.role;

      if (role === "PATIENT") {
        navigate("/patient");
      } else if (role === "DOCTOR") {
        navigate("/doctor");
      } else if (role === "STAFF") {
        navigate("/staff");
      }
    } catch (err) {
      console.error(err);

      toast.error("Google Login Failed");
    }
  };

  return (
    <HomeLayout>
      <div className="min-h-[calc(100vh-80px)] flex justify-center items-center bg-gradient-to-r from-blue-50 to-indigo-100 px-6 py-16">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left Illustration */}
          <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10 relative">
            <h2 className="text-4xl text-white font-bold mb-4">
              Join MediCare Today 👋
            </h2>
            <p className="text-lg opacity-90 mb-8 text-center">
              Seamlessly manage appointments, records, and communications.
            </p>
            <img
              src="/illustrations/register-illustration.png"
              alt="Register Illustration"
              className="w-3/4 animate-float"
            />
          </div>

          {/* Right Form */}
          <div className="p-10 md:p-14 flex flex-col justify-center relative bg-white">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2 text-center md:text-left">
              Create Your Account
            </h1>
            <p className="text-gray-500 mb-8 text-center md:text-left">
              Fill in your details to get started
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  {...register("name")}
                  placeholder="Enter your full name"
                  className={`w-full border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Enter your email"
                  className={`w-full border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  maxLength={10}
                  placeholder="Enter Indian mobile number"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                  className={`w-full border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition`}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Enter your password"
                  className={`w-full border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition`}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  {...register("role")}
                  className={`w-full border ${errors.role ? "border-red-500" : "border-gray-300"} rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition`}
                >
                  <option value="">Select Role</option>
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="STAFF">Staff</option>
                </select>
                {errors.role && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-transform transform hover:-translate-y-0.5 duration-300"
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            </form>
            <div className="mt-5 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  toast.error("Google Signup Failed");
                }}
              />
            </div>

            <p className="text-center text-gray-600 mt-6 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Floating Animation */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          .animate-float { animation: float 6s ease-in-out infinite; }
        `}
      </style>
    </HomeLayout>
  );
}
