import axios from "axios";

const AI_API = "http://localhost:8000";

export const summarizeNotes = async (text) => {
  const response = await axios.post(`${AI_API}/summarize`, { text });
  // returns { success, medicines: [...], generalNote: "..." }
  return response.data;
};

export const translateNotes = async (text, targetLanguage) => {
  const response = await axios.post(`${AI_API}/translate`, {
    text,
    targetLanguage,
  });

  return response.data;
};
