import api from "./axiosInstance";

// Fetch all doctors with user info
export const getAllDoctors = async () => {
  const res = await api.get("/doctors/with-user");
  return res.data;
};

// Fetch logged-in doctor's profile
export const getMyProfile = async () => {
  const res = await api.get("/doctors/me");
  return res.data;
};

// Update logged-in doctor profile
export const updateDoctorProfile = async (data) => {
  const res = await api.put("/doctors", data); // Changed to PUT
  return res.data;
};
