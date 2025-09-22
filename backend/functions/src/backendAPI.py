# run python -m uvicorn backendAPI:app --reload --port 8000 at cd backend/funcitons/src

import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for now, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/parse-cv")
async def parse_cv(file: UploadFile = File(...)):
    contents = await file.read()

    # ✅ Use a cross-platform temporary path
    temp_path = os.path.join(os.getcwd(), "temp.pdf")

    with open(temp_path, "wb") as f:
        f.write(contents)

    doc = fitz.open(temp_path)
    text = "".join([page.get_text() for page in doc])
    doc.close()

    return {"text": text}
