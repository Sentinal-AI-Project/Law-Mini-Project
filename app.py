from fastapi import FastAPI, UploadFile, File, Body
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import uvicorn

from audit_pipeline import audit_pipeline

app = FastAPI()

class AnalyzeRequest(BaseModel):
    doc_id: str
    file_path: str
    frameworks: Optional[List[str]] = []

@app.get("/")
def home():
    return {"message": "NLP AI Service running 🚀"}

import requests
import tempfile

@app.post("/analyze")
async def analyze_doc(request: AnalyzeRequest):
    is_url = request.file_path.startswith("http")
    temp_file_path = None
    target_path = request.file_path

    if is_url:
        # Download from Supabase URL
        response = requests.get(request.file_path, timeout=60)
        if response.status_code != 200:
            return {"error": f"Failed to download file from {request.file_path}"}
        
        # Create a temp file based on extension
        ext = os.path.splitext(request.file_path)[1]
        if not ext:
            ext = ".pdf" # Default to pdf just in case
            
        fd, temp_file_path = tempfile.mkstemp(suffix=ext)
        with os.fdopen(fd, 'wb') as f:
            f.write(response.content)
        target_path = temp_file_path
    elif not os.path.exists(target_path):
        return {"error": f"File not found at {target_path}"}

    try:
        # Run the pipeline
        report_filename = f"report_{request.doc_id}.pdf"
        results = audit_pipeline(target_path, report_filename=report_filename)
        print(f"📊 Processing complete. Found {len(results)} raw findings.")
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)

    # Map results to what Node.js expects
    # Node expects: risk_type, severity, confidence, description, evidence_snippet
    mapped_findings = []
    for r in results:
        mapped_findings.append({
            "risk_type": r["law"],
            "severity": r["severity"].lower(), # Node expects lowercase 'high', 'medium', etc.
            "confidence": r["confidence"],
            "description": r["explanation"],
            "evidence_snippet": r["clause"],
            "clause_id": None,
            "policy_ref_id": None
        })

    return {
        "doc_id": request.doc_id,
        "findings": mapped_findings,
        "report_url": f"/download-report/{report_filename}"
    }

@app.get("/download-report/{filename}")
def download_report(filename: str):
    file_path = filename
    if not os.path.exists(file_path):
        return {"error": "Report not found."}

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/pdf"
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)