import axios from "axios";

const AI_API =
    "http://localhost:8000";

export const transcribeAudio =
    async (audioBlob) => {

    const formData = new FormData();

    formData.append(
        "audio",
        audioBlob,
        "recording.webm"
    );

    const response = await axios.post(
        `${AI_API}/transcribe`,
        formData,
        {
            headers: {
                "Content-Type":
                    "multipart/form-data"
            }
        }
    );

    return response.data;
};