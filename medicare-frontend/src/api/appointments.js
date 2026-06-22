import api from "./axiosInstance";

// ======================================================
// BOOK APPOINTMENT
// ======================================================

export const bookAppointment =
  async (data) => {

  const res =
    await api.post(
      "/appointments/book",
      data
    );

  return res.data;
};

export const deleteAppointment = async (id) => {

  const response = await api.delete(
    `/appointments/${id}`
  );

  return response.data;
};

// ======================================================
// GET MY APPOINTMENTS
// ======================================================

export const getMyAppointments =
  async () => {

  const res =
    await api.get(
      "/appointments/my"
    );

  return res.data;
};

// ======================================================
// GET ALL DOCTORS
// ======================================================

export const getAllDoctors =
  async () => {

  const res =
    await api.get(
      "/doctors/with-user"
    );

  return res.data;
};

// ======================================================
// UPDATE APPOINTMENT STATUS
// ======================================================

export const updateAppointmentStatus =
  async (id, status) => {

  const res =
    await api.patch(
      `/appointments/${id}/status`,
      { status }
    );

  return res.data;
};

// ======================================================
// OLD SINGLE NOTES UPDATE
// OPTIONAL
// ======================================================

export const updateAppointmentNotes =
  async (id, notes) => {

  const res =
    await api.patch(
      `/appointments/${id}/notes`,
      { notes }
    );

  return res.data;
};

// ======================================================
// ADD NEW NOTE
// ======================================================

export const addAppointmentNote =
  async (
    appointmentId,
    noteText
  ) => {

  const response =
    await api.post(
      `/appointments/${appointmentId}/notes`,
      { noteText }
    );

  return response.data;
};

// ======================================================
// GET APPOINTMENT NOTES
// ======================================================

export const getAppointmentNotes =
  async (appointmentId) => {

  const response =
    await api.get(
      `/appointments/${appointmentId}/notes`
    );

  return response.data;
};

export const updateAppointmentNote =
  async (
    noteId,
    noteText
  ) => {

    const response =
      await api.put(
        `/appointments/notes/${noteId}`,
        { noteText }
      );

    return response.data;
};

export const deleteAppointmentNote =
  async (noteId) => {

    const response =
      await api.delete(
        `/appointments/notes/${noteId}`
      );

    return response.data;
};