import api from "./axiosInstance";

// Fetch logged-in staff profile
export const getStaffProfile = async () => {
  const res = await api.get("/staff/me");
  return res.data;
};

// Update staff profile
export const updateStaffProfile = async (data) => {
  const res = await api.put("/staff/update", data);
  return res.data;
};
