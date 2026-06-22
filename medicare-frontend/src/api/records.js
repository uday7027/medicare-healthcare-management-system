import api from "./axiosInstance";

export const getPatientRecords = async (id) => {
  const res = await api.get(`/records/patient/${id}`);
  return res.data;
};
