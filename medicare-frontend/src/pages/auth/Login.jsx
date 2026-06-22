import React from "react";

import HomeLayout from "../../components/layouts/HomeLayout";

import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";

import * as yup from "yup";

import { yupResolver } from "@hookform/resolvers/yup";

import { loginUser } from "../../api/auth";

import { useAuth } from "../../context/AuthContext";

import { toast } from "react-toastify";

import { GoogleLogin } from "@react-oauth/google";

import axios from "axios";

// Validation schema

// Validation schema
const schema = yup.object({
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

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export default function Login() {
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

  // ===================================
  // GOOGLE LOGIN SUCCESS HANDLER
  // ===================================

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/google",
        {
          token: credentialResponse.credential,
        },
      );

      const payload = response.data;

      login(payload);

      toast.success("Google Login Successful");

      if (payload.needsRoleSelection) {
        // Save email temporarily
        localStorage.setItem("googleEmail", payload.user.email);

        navigate("/select-role");

        return;
      }

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

  // ===================================
  // NORMAL LOGIN
  // ===================================

  const onSubmit = async (data) => {
    try {
      const payload = await loginUser(data);

      // Safety check

      if (!payload.user) {
        toast.error("Login failed: User data missing");

        return;
      }

      // Save auth data

      login(payload);

      toast.success("Login successful!");

      // Reset fields

      setValue("email", "");
      setValue("password", "");

      // Role-based redirect

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

      const message =
        err.response?.data?.message || err.response?.data || "Login failed";

      // ===================================
      // EMAIL NOT VERIFIED FLOW
      // ===================================

      if (message.includes("verify your email")) {
        toast.warning("Please verify your email first");

        // Store email for OTP page

        localStorage.setItem("verifyEmail", data.email);

        // Redirect to OTP page

        navigate("/verify-otp");

        return;
      }

      toast.error(message);
    }
  };

  return (
    <HomeLayout>
      <div
        className="
        min-h-[calc(100vh-80px)]
        flex justify-center items-center
        bg-gradient-to-r
        from-blue-50 to-indigo-100
        px-6 py-16
      "
      >
        <div
          className="
          w-full max-w-5xl
          bg-white rounded-3xl
          shadow-2xl overflow-hidden
          grid grid-cols-1 md:grid-cols-2
        "
        >
          {/* LEFT SIDE */}

          <div
            className="
            hidden md:flex flex-col
            justify-center items-center
            bg-gradient-to-br
            from-blue-600 to-indigo-700
            text-white p-10 relative
          "
          >
            <h2
              className="
              text-4xl font-bold mb-4 text-white
            "
            >
              Welcome Back 👋
            </h2>

            <p
              className="
              text-lg opacity-90
              mb-8 text-center
            "
            >
              Access your MediCare dashboard and manage your health records
              easily.
            </p>

            <img
              src="/illustrations/login-illustration.png"
              alt="Login Illustration"
              className="
                w-3/4 animate-float
              "
            />
          </div>

          {/* RIGHT SIDE */}

          <div
            className="
            p-10 md:p-14
            flex flex-col justify-center
            relative bg-white
          "
          >
            <h1
              className="
              text-3xl font-extrabold
              text-gray-800 mb-2
              text-center md:text-left
            "
            >
              Login to MediCare
            </h1>

            <p
              className="
              text-gray-500 mb-8
              text-center md:text-left
            "
            >
              Enter your credentials to continue
            </p>

            {/* LOGIN FORM */}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* EMAIL */}

              <div>
                <label
                  className="
                  block text-sm font-medium
                  text-gray-700 mb-1
                "
                >
                  Email Address
                </label>

                <input
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  placeholder="Enter your email"
                  className={`
    w-full border
    ${errors.email ? "border-red-500" : "border-gray-300"}
    rounded-xl px-4 py-3
    text-gray-700
    focus:outline-none
    focus:ring-2
    focus:ring-primary
    transition
  `}
                />

                {errors.email && (
                  <p
                    className="
                    text-sm text-red-500 mt-1
                  "
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* PASSWORD */}

              <div>
                <label
                  className="
                  block text-sm font-medium
                  text-gray-700 mb-1
                "
                >
                  Password
                </label>

                <input
                  type="password"
                  {...register("password")}
                  placeholder="Enter your password"
                  className={`
    w-full border
    ${errors.password ? "border-red-500" : "border-gray-300"}
    rounded-xl px-4 py-3
    text-gray-700
    focus:outline-none
    focus:ring-2
    focus:ring-primary
    transition
  `}
                />

                {errors.password && (
                  <p
                    className="
                    text-sm text-red-500 mt-1
                  "
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  w-full bg-primary
                  text-white py-3
                  rounded-xl
                  font-semibold text-lg
                  shadow-md
                  hover:bg-blue-700
                  hover:shadow-lg
                  transition-transform
                  transform
                  hover:-translate-y-0.5
                  duration-300
                "
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* DIVIDER */}

            <div
              className="
              flex items-center my-6
            "
            >
              <div
                className="
                flex-grow border-t
                border-gray-300
              "
              ></div>

              <span
                className="
                mx-4 text-gray-400 text-sm
              "
              >
                OR
              </span>

              <div
                className="
                flex-grow border-t
                border-gray-300
              "
              ></div>
            </div>

            {/* GOOGLE LOGIN */}

            <div
              className="
              flex justify-center
            "
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  toast.error("Google Login Failed");
                }}
              />
            </div>

            {/* REGISTER LINK */}

            <p
              className="
              text-center text-gray-600
              mt-6 text-sm
            "
            >
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="
                  text-primary
                  font-semibold
                  hover:underline
                "
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* FLOAT ANIMATION */}

      <style>
        {`
          @keyframes float {

            0%, 100% {

              transform:
                translateY(0px);
            }

            50% {

              transform:
                translateY(-15px);
            }
          }

          .animate-float {

            animation:
              float 6s ease-in-out infinite;
          }
        `}
      </style>
    </HomeLayout>
  );
}
