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
import json
import os
import tempfile
from dotenv import load_dotenv

# Load .env file
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "your_openrouter_api_key_here")

import time

def get_remediation_suggestion(clause, risk_description):
    """Call OpenRouter to get a suggested compliant clause with retry logic."""
    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY == "your_openrouter_api_key_here":
        return "Please configure OPENROUTER_API_KEY to see remediation suggestions."
    
    max_retries = 5
    base_delay = 5 # Increased delay to be safer
    
    for attempt in range(max_retries):
        try:
            prompt = f"""
            You are a legal compliance expert. 
            The following legal clause has been flagged as HIGH RISK.
            
            Original Clause: "{clause}"
            Risk Found: {risk_description}
            
            Please provide a professional, legally compliant "Sample Compliant Clause" that remediates the risk while maintaining the original intent where possible. 
            Format your response as a direct replacement clause text only.
            """
            
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY.strip()}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-OpenRouter-Title": "Sentinel Law AI"
                },
                data=json.dumps({
                    "model": "google/gemini-2.0-flash-lite-001", 
                    "messages": [
                        {"role": "user", "content": prompt}
                    ]
                }),
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content'].strip()
            elif response.status_code == 429:
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)
                    print(f"⚠️ AI Rate limit hit (429). Retrying in {delay}s... (Attempt {attempt + 1})")
                    time.sleep(delay)
                    continue
                else:
                    return "AI service is currently busy (Rate Limit). Please try again in a moment."
            else:
                error_data = response.json() if response.content else {"message": "No error details provided"}
                print(f"❌ OpenRouter Error ({response.status_code}): {json.dumps(error_data)}")
                return f"AI Generation Failed (Status {response.status_code}): {error_data.get('error', {}).get('message', 'Unknown error')}"
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(base_delay)
                continue
            return f"Remediation error: {str(e)}"
    return "Remediation generation failed after multiple attempts."

class FixRequest(BaseModel):
    clause: str
    explanation: str

@app.post("/generate-fix")
async def generate_fix(request: FixRequest):
    """Generate a remediation suggestion for a single finding on demand."""
    print(f"✨ Generating on-demand AI remediation...")
    suggestion = get_remediation_suggestion(request.clause, request.explanation)
    return {"suggested_fix": suggestion}

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
        
        # Map results to what Node.js expects
        mapped_findings = []
        for r in results:
            severity = r["severity"].lower()
            
            # Note: We no longer generate suggested_fix here upfront
            
            mapped_findings.append({
                "risk_type": r["law"],
                "severity": severity,
                "confidence": r["confidence"],
                "description": r["explanation"],
                "evidence_snippet": r["clause"],
                "suggested_fix": None, # Will be generated on demand
                "clause_id": None,
                "policy_ref_id": None
            })

    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)

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