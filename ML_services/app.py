from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import joblib
import pandas as pd

from faster_whisper import WhisperModel
from deep_translator import GoogleTranslator
from groq import Groq

from dotenv import load_dotenv
import uuid
import os
import shutil
import re
from collections import Counter

# =========================================================
# LOAD ENV
# =========================================================

load_dotenv()

# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI()

# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# LOAD NO SHOW PREDICTION MODEL
# =========================================================

print("Loading prediction model...")
model = joblib.load("model.joblib")
preprocessor = joblib.load("preprocessor.joblib")
print("Prediction model loaded!")

# =========================================================
# LOAD WHISPER MODEL
# =========================================================

print("Loading Whisper model...")
whisper_model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)
print("Whisper model loaded!")

# =========================================================
# GROQ CLIENT
# =========================================================

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
print("Groq client initialized!")

# =========================================================
# CONSTANTS
# =========================================================

MODE_WEIGHTS = {
    "offline":      1,
    "online":       2,
    "video":        2,
    "telemedicine": 3,
}


def calculate_lead_score(days: int) -> float:
    if days <= 5:
        return 1
    elif days <= 10:
        return 2
    elif days <= 20:
        return 3
    elif days <= 30:
        return 5
    else:
        return 10


def calculate_missed_score(missed: int) -> float:
    if missed == 0:
        return 0.5
    elif missed == 1:
        return 4
    elif missed == 2:
        return 7
    else:
        return 10

UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# =========================================================
# DTO CLASSES
# =========================================================

class SummaryRequest(BaseModel):
    text: str

class TranslateRequest(BaseModel):
    text: str
    targetLanguage: str

# =========================================================
# NO SHOW PREDICTION API
# =========================================================

@app.post("/predict")
def predict(payload: dict):
    try:
        appt_dt = pd.to_datetime(payload["appointmentDate"])
        sched_dt = pd.to_datetime(payload["scheduledDate"])
        lead_days = max(0, (appt_dt - sched_dt).days)

        lead_days_score    = calculate_lead_score(lead_days)
        missed_visits      = int(payload.get("missedVisits", 0))
        missed_visits_score = calculate_missed_score(missed_visits)
        mode               = str(payload.get("mode", "offline")).lower()
        mode_score         = MODE_WEIGHTS.get(mode, 1)
        combined_risk      = (lead_days_score * 0.4) + (missed_visits_score * 0.6)
        age                = int(payload.get("age", 30))

        # Features must match notebook training order exactly:
        # Age, lead_days_score, missed_visits_score, combined_risk, mode_score
        row = pd.DataFrame([{
            "Age":                  age,
            "lead_days_score":      lead_days_score,
            "missed_visits_score":  missed_visits_score,
            "combined_risk":        combined_risk,
            "mode_score":           mode_score,
        }])

        probs = model.predict_proba(row)[0]

        return {
            "no_show_probability": round(float(probs[0]), 4),
            "show_probability":    round(float(probs[1]), 4),
        }

    except Exception as e:
        print("PREDICT ERROR:", e)
        return {"success": False, "message": str(e)}

# =========================================================
# SPEECH TO TEXT API
# =========================================================

@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    print("Received audio file:", audio.filename)

    filename = f"{uuid.uuid4()}.webm"
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)

    print("Saved file at:", filepath)

    try:
        print("Starting transcription...")
        segments, info = whisper_model.transcribe(filepath)

        transcription = ""
        for segment in segments:
            print("Segment:", segment.text)
            transcription += segment.text + " "

        print("Final text:", transcription.strip())
        return {
            "success": True,
            "text": transcription.strip()
        }

    except Exception as e:
        print("TRANSCRIBE ERROR:", e)
        return {"success": False, "message": str(e)}

    finally:
        # ✅ always clean up uploaded file even if transcription fails
        if os.path.exists(filepath):
            os.remove(filepath)

# =========================================================
# SUMMARIZE API — structured JSON via Groq
# =========================================================

@app.post("/summarize")
def summarize_notes(request: SummaryRequest):
    try:
        text = request.text.strip()

        if not text:
            return {"success": False, "message": "No text provided"}

        if len(text.split()) < 5:
            return {"success": True, "medicines": [], "generalNote": text}

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # ✅ updated model
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a medical assistant that extracts prescription details. "
                        "From the doctor's note, extract every medicine mentioned and return ONLY a JSON object. "
                        "No explanation, no markdown, no extra text — just raw JSON. "
                        "The JSON must follow this exact structure:\n"
                        "{\n"
                        '  "medicines": [\n'
                        '    { "name": "Medicine name", "dosage": "e.g. 650mg", "frequency": "e.g. Twice a day", "days": "e.g. 5 days", "instructions": "e.g. After food" }\n'
                        "  ],\n"
                        '  "generalNote": "Any general advice like rest, avoid cold food, follow up etc."\n'
                        "}\n"
                        "If a field is not mentioned, use an empty string for that field. "
                        "If no medicines are found, return an empty medicines array."
                    )
                },
                {
                    "role": "user",
                    "content": f"Extract medicines from this prescription:\n\n{text}"
                }
            ],
            max_tokens=600,
            temperature=0.1,
        )

        raw = response.choices[0].message.content.strip()
        print("Groq raw response:", raw)

        import re, json
        raw = re.sub(r"```(?:json)?", "", raw).strip()
        parsed = json.loads(raw)

        return {
            "success": True,
            "medicines": parsed.get("medicines", []),
            "generalNote": parsed.get("generalNote", ""),
        }

    except Exception as e:
        print("SUMMARIZE ERROR:", e)
        return {"success": False, "message": str(e)}
# =========================================================
# TRANSLATION API
# =========================================================

@app.post("/translate")
def translate_notes(request: TranslateRequest):
    try:
        text = request.text.strip()

        if not text:
            return {"success": False, "message": "No text provided"}

        if request.targetLanguage == "en":
            return {"success": True, "translatedText": text}

        translated_text = GoogleTranslator(
            source="auto",
            target=request.targetLanguage
        ).translate(text)

        return {"success": True, "translatedText": translated_text}

    except Exception as e:
        print("TRANSLATE ERROR:", e)
        return {"success": False, "message": str(e)}