import React from "react";

import { summarizeNotes, translateNotes } from "./api/ai";
import { transcribeAudio } from "./api/speech";

export default function TestAI() {
  const testSummary = async () => {
    const result = await summarizeNotes(
      "Patient has fever and cough. Take medicine twice daily after food.",
    );

    console.log(result);
  };

  const testTranslation = async () => {
    const result = await translateNotes("Take medicine after food", "mr");

    console.log(result);
  };

  const testSpeech = async () => {
    const response = await fetch("/sample.webm");

    const blob = await response.blob();

    const result = await transcribeAudio(blob);

    console.log(result);
  };

  return (
    <div className="p-10">
      <button
        onClick={testSummary}
        className="bg-blue-500 text-white px-4 py-2 mr-4"
      >
        Test Summary
      </button>

      <button
        onClick={testTranslation}
        className="bg-green-500 text-white px-4 py-2"
      >
        Test Translation
      </button>
      <button onClick={testSpeech} className="bg-red-500 text-white px-4 py-2">
        Test Speech
      </button>
    </div>
  );
}
