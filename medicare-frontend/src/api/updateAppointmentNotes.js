// Update notes for appointment
export const updateAppointmentNotes = async (id, notes) => {
  const res = await api.patch(`/appointments/${id}/notes`, { notes });
  return res.data;
};
