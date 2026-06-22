import React, { useState } from "react";
import HomeLayout from "../../components/layouts/HomeLayout";
import { useNavigate } from "react-router-dom";
import { verifyOtp } from "../../api/auth";
import { toast } from "react-toastify";
import axios from "axios";

export default function VerifyOtp() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState(new Array(6).fill(""));

  const email = localStorage.getItem("verifyEmail");

  const [loading, setLoading] = useState(false);
  const finalOtp = otp.join("");
  const [timer, setTimer] = useState(60);

  const inputRefs = React.useRef([]);

  const handleVerify = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    await verifyOtp({
      email,
      otp: finalOtp,
    });

    toast.success("Email verified successfully");

    localStorage.removeItem("verifyEmail");

    navigate("/login");
  } catch (err) {
    console.error(err);

    toast.error("Please enter correct OTP");
  } finally {
    setLoading(false);
  }
};

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);

    const seconds = timer % 60;

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  React.useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];

    newOtp[index] = element.value;

    setOtp(newOtp);

    // Auto focus next
    if (element.value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text");

    if (!/^\d+$/.test(pasteData)) return;

    const pasteArray = pasteData.slice(0, 6).split("");

    const newOtp = [...otp];

    pasteArray.forEach((char, index) => {
      newOtp[index] = char;
    });

    setOtp(newOtp);
  };

  const handleResendOTP = async () => {
    try {
      await axios.post("http://localhost:8080/api/auth/resend-otp", { email });

      toast.success("OTP resent successfully");

      setTimer(300);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  React.useEffect(() => {
    const email = localStorage.getItem("verifyEmail");

    if (!email) {
      navigate("/register");
    }
  }, []);

  return (
    <HomeLayout>
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-50 to-indigo-100 px-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-3">
            Verify OTP
          </h1>

          <p className="text-center text-gray-500 mb-8">
            Enter the OTP sent to your email
          </p>

          <form onSubmit={handleVerify} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>

              <input
                type="email"
                value={email || ""}
                disabled
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-100 text-gray-600"
              />
            </div>

            {/* OTP */}
            {/* OTP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                OTP
              </label>

              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={data}
                    ref={(el) => (inputRefs.current[index] = el)}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="
          w-12 h-12
          text-center
          border border-gray-300
          rounded-xl
          text-xl
          font-bold
          focus:outline-none
          focus:ring-2
          focus:ring-primary
        "
                  />
                ))}
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <p className="text-center text-sm text-gray-500">
              OTP expires in {formatTime()}
            </p>
            <button
              onClick={handleResendOTP}
              disabled={timer > 0}
              className={`text-sm font-medium ${
                timer > 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-primary hover:underline"
              }`}
            >
              Resend OTP
            </button>
          </form>
        </div>
      </div>
    </HomeLayout>
  );
}
