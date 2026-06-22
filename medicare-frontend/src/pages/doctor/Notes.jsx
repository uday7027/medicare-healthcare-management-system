import React, { useRef, useState } from "react";
import { transcribeAudio } from "../../api/speech";

const Notes = () => {
  const [notes, setNotes] = useState("");

  const [recording, setRecording] = useState(false);

  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef(null);

  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        setLoading(true);

        try {
          const result = await transcribeAudio(audioBlob);

          console.log("RESULT:", result);

          if (result.text) {
            setNotes((prev) => prev + " " + result.text);

            toast.success("Speech converted!");
          } else {
            console.log("NO TEXT FOUND");

            toast.error("No transcription text returned");
          }
        } catch (error) {
          console.error("TRANSCRIPTION ERROR:", error);

          toast.error("Transcription failed");
        }

        setLoading(false);
      };

      mediaRecorder.start();

      setRecording(true);
    } catch (error) {
      console.error(error);

      alert("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();

    setRecording(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Doctor Notes</h1>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={10}
        className="w-full border rounded p-3"
        placeholder="Doctor notes..."
      />

      <div className="mt-4 flex gap-4">
        {!recording ? (
          <button
            onClick={startRecording}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            🎤 Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            ⏹ Stop Recording
          </button>
        )}
      </div>

      {loading && <p className="mt-3">Converting speech to text...</p>}
    </div>
  );
};

export default Notes;
