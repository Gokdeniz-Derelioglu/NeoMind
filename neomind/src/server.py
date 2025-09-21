# pip install --upgrade openai python-dotenv
import os
import json
from typing import Optional, Dict, Any
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Access the API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def generate_cover_letter_from_inputs(
    cv_text: str,
    job_json: str,
    *,
    model: str = None,
    candidate_overrides: Optional[Dict[str, Any]] = None,
    max_output_tokens: int = 700
) -> str:
    """
    Build a robust prompt from a large CV string and a job.json string,
    then call the OpenAI Responses API and return ONLY the final cover letter text.

    Parameters
    ----------
    cv_text : str
        Arbitrarily large CV/resume text (paste your entire CV here).
    job_json : str
        A JSON string describing the job (e.g., fields like firm name, job field,
        required skills, past projects, required work experience). Must be valid JSON.
    model : str, optional
        OpenAI model name. Defaults to env var OPENAI_MODEL or "gpt-4o-mini".
    candidate_overrides : dict, optional
        Optional dict to override/add metadata inferred from the CV.
        Example: {"name": "Arda Yüksel", "email": "arda@example.com", "phone": "+90 ..."}
    max_output_tokens : int
        Upper bound for the cover letter generation.

    Returns
    -------
    str
        Final cover letter text (no JSON, no explanations).
    """
    # Resolve model
    model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # Parse job JSON early to fail fast if malformed
    try:
        job_obj = json.loads(job_json)
    except Exception as e:
        raise ValueError(f"job_json must be valid JSON. Parse error: {e}")

    # Optional override metadata (e.g., name/email/phone)
    candidate_overrides = candidate_overrides or {}
    name    = candidate_overrides.get("name", "")
    email   = candidate_overrides.get("email", "")
    phone   = candidate_overrides.get("phone", "")
    headline= candidate_overrides.get("headline", "")

    # Style + rubric: tight, ATS-friendly, maps requirements -> evidence in CV
    style_rules = """\
Write a concise, one-page cover letter (180–260 words) that:
- Uses the firm name if provided.
- Hooks with one sentence that references the job field and (if present) the candidate headline.
- Maps REQUIRED SKILLS / EXPERIENCE from the job JSON to concrete evidence from the CV (show 2–3 proof/impact lines).
- Keeps tone professional, energetic, and specific (avoid generic fluff).
- Ends with a proactive closing and a signature block (use name/email/phone if available).
- No lorem ipsum. No placeholders. Do not repeat the job title excessively.
"""

    # Clear, explicit instructions; provide both blocks verbatim to the model
    prompt = f"""You are an expert career writer and ATS-savvy editor.
You will receive two blocks:
(1) A JSON object describing the job.
(2) A raw CV text.

Task:
- Parse both.
- Write a tailored cover letter following the STYLE RULES.
- Return ONLY the final cover letter text (no JSON, no explanations).

=== STYLE RULES ===
{style_rules}

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

    client = OpenAI()
    resp = client.responses.create(
        model=model,
        max_output_tokens=max_output_tokens,
        input=[
            {"role": "system", "content": "You are an expert career writer and ATS-savvy editor."},
            {"role": "user", "content": prompt},
        ],
    )
    # Most SDKs expose a convenience `output_text` that concatenates all text outputs.
    return resp.output_text


# ---- Example usage ----
if __name__ == "__main__":
    # Example job.json (string). Replace with your real JSON (keep it valid).
    job_json_str = json.dumps({
        "firm name": "SAMM Teknoloji",
        "job field": "Machine Learning Engineer (Audio/DAS)",
        "required skills": ["Python", "Signal Processing", "ML Ops", "Streamlit"],
        "past projects": ["Wavelet-based labeling tool", "Spectrogram visualization", "PCA filtering"],
        "required work experience": 1
    }, ensure_ascii=False)

    # Example CV (string). Paste your full CV here.
    cv_str = """Arda Yüksel — Computer Engineering student (Bilkent)
Projects: FOTAS labeling tool (Streamlit, HDF5/BIN), PCA/FFT filters for DAS, TimesNet experiments...
Skills: Python, NumPy, SciPy, sklearn, Streamlit, audio DSP, labeling pipelines...
Achievements: Led Python/ML workshops for 130+ students; built real-time coding app; internship on audio ML...
Contact: arda@example.com | +90 5xx xxx xx xx
"""

    letter = generate_cover_letter_from_inputs(
        cv_text=cv_str,
        job_json=job_json_str,
        candidate_overrides={
            "name": "Arda Yüksel",
            "email": "arda@example.com",
            "phone": "+90 5xx xxx xx xx",
            "headline": "Computer Engineering student focusing on ML + data systems",
        },
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    )
    print(letter)
