import api from "./axiosInstance";

export const getPatientProfile = async () => {
  const res = await api.get("/patients/me");
  return res.data;
};
