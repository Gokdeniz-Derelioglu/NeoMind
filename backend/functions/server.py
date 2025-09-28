# server.py
# pip install fastapi uvicorn "pydantic>=2" python-dotenv openai

import os
import json
from typing import Optional, Dict, Any, Union

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ValidationError
from openai import OpenAI
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ---- Env ----
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not set in environment (.env).")
if not EMAIL_USER or not EMAIL_PASS:
    raise RuntimeError("EMAIL_USER or EMAIL_PASS is not set in environment (.env).")

client = OpenAI(api_key=OPENAI_API_KEY)

# ---- FastAPI app ----
app = FastAPI(title="Cover Letter Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # during dev; restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Schemas ----
class CandidateOverrides(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    headline: Optional[str] = None

class GenerateRequest(BaseModel):
    cv_text: str = Field(..., description="Full CV/resume text")
    job_json: Union[str, Dict[str, Any]] = Field(
        ..., description="Job JSON (object or stringified JSON)"
    )
    candidate_overrides: Optional[CandidateOverrides] = None
    model: Optional[str] = None
    max_output_tokens: int = 700
    recipient_email: Optional[str] = None  # NEW: pass recipient dynamically

class GenerateResponse(BaseModel):
    letter: str

# ---- Style rules ----
STYLE_RULES = """\
Write a concise, one-page cover letter (180–260 words) that:
- Uses the firm name if provided.
- Hooks with one sentence that references the job field and (if present) the candidate headline.
- Maps REQUIRED SKILLS / EXPERIENCE from the job JSON to concrete evidence from the CV (show 2–3 proof/impact lines).
- Keeps tone professional, energetic, and specific (avoid generic fluff).
- Ends with a proactive closing and a signature block (use name/email/phone if available).
- No lorem ipsum. No placeholders. Do not repeat the job title excessively.
"""

# ---- Prompt builder ----
def build_prompt(cv_text: str, job_obj: Dict[str, Any], candidate_overrides: Dict[str, Any]) -> str:
    name     = candidate_overrides.get("name", "")
    email    = candidate_overrides.get("email", "")
    phone    = candidate_overrides.get("phone", "")
    headline = candidate_overrides.get("headline", "")

    return f"""You are an expert career writer and ATS-savvy editor.
You will receive two blocks:
(1) A JSON object describing the job.
(2) A raw CV text.

Task:
- Parse both.
- Write a tailored cover letter following the STYLE RULES.
- Return ONLY the final cover letter text (no JSON, no explanations).

=== STYLE RULES ===
{STYLE_RULES}

=== JOB.JSON ===
{json.dumps(job_obj, ensure_ascii=False, indent=2)}

=== CV TEXT (VERBATIM) ===
{cv_text}

=== CANDIDATE META (OPTIONAL) ===
name: {name}
email: {email}
phone: {phone}
headline: {headline}
"""

# ---- Core generator ----
def generate_cover_letter_from_inputs(
    cv_text: str,
    job_json: Union[str, Dict[str, Any]],
    *,
    model: Optional[str] = None,
    candidate_overrides: Optional[Dict[str, Any]] = None,
    max_output_tokens: int = 700,
) -> str:
    # Normalize job JSON
    if isinstance(job_json, str):
        job_obj = json.loads(job_json)
    elif isinstance(job_json, dict):
        job_obj = job_json
    else:
        raise ValueError("job_json must be a JSON string or a dict.")

    model = model or DEFAULT_MODEL
    prompt = build_prompt(cv_text, job_obj, candidate_overrides or {})

    resp = client.responses.create(
        model=model,
        max_output_tokens=max_output_tokens,
        input=[
            {"role": "system", "content": "You are an expert career writer and ATS-savvy editor."},
            {"role": "user", "content": prompt},
        ],
    )

    letter = getattr(resp, "output_text", None)
    if not letter:
        raise RuntimeError("No text output returned from model.")

    return letter.strip()

# ---- Mail sender ----
def send_email(to_email: str, subject: str, body: str):
    msg = MIMEMultipart()
    msg["From"] = f"NeoMind <{EMAIL_USER}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_USER, to_email, msg.as_string())
        print(f"✅ Email sent to {to_email}", flush=True)
    except Exception as e:
        print(f"❌ Failed to send email: {e}", flush=True)

# ---- Routes ----
@app.get("/health")
def health():
    return {"ok": True}

@app.post("/generate-cover-letter", response_model=GenerateResponse)
def generate_cover_letter(req: GenerateRequest):
    try:
        letter = generate_cover_letter_from_inputs(
            cv_text=req.cv_text,
            job_json=req.job_json,
            model=req.model,
            candidate_overrides=(req.candidate_overrides.model_dump() if req.candidate_overrides else None),
            max_output_tokens=req.max_output_tokens,
        )

        # Send mail if requested
        if req.recipient_email:
            send_email(req.recipient_email, "Job Application", letter)

        return GenerateResponse(letter=letter)

    except (ValidationError, ValueError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
