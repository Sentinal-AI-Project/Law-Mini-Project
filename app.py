# =============================================================================
# Sentinel Law — Python AI Microservice (FastAPI, port 5001)
#
# This service is called by the Node.js backend (nlp.service.js) at:
#   POST /analyze          → run NLP audit on an uploaded document
#   POST /generate-fix     → generate on-demand AI remediation for a finding
#   GET  /download-report  → serve a generated PDF report
#
# NLP Pipeline: AI/Engine/* (new pipeline)
# The old audit_pipeline.py is intentionally left in place but is no longer used.
# =============================================================================

import os
import tempfile
import json
import time
import requests

import uvicorn
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from io import BytesIO
from dotenv import load_dotenv

# ─── New AI Engine Imports ───────────────────────────────────────────────────
from AI.Engine.audit_engine import run_audit, calculate_compliance_score
from AI.services.pdf_services import extract_text_from_pdf

# ─── Environment ─────────────────────────────────────────────────────────────
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

app = FastAPI(title="Sentinel Law AI Service")


# =============================================================================
# HEALTH CHECK
# =============================================================================
@app.get("/")
def home():
    return {"message": "Sentinel Law AI Service running 🚀 (New AI Engine Active)"}


# =============================================================================
# REQUEST MODELS
# =============================================================================
class AnalyzeRequest(BaseModel):
    doc_id: str
    file_path: str
    frameworks: Optional[List[str]] = []


class FixRequest(BaseModel):
    clause: str
    explanation: str


# =============================================================================
# HELPER — MAP NEW ENGINE RESULT → API CONTRACT
# The new AI engine returns per-clause dicts with these keys:
#   clause        : str  — the raw clause text
#   matched_rule  : str  — description of the matched compliance rule
#   framework     : str  — e.g. "GDPR", "HIPAA", "SOC2"
#   score         : float — cosine similarity score (0–1)
#   risk          : str  — "High" | "Medium" | "Low"
#
# The Node.js service (nlp.service.js) expects:
#   risk_type, severity, confidence, description, evidence_snippet, suggested_fix
# =============================================================================
def _map_result(r: dict) -> dict:
    risk_label = (r.get("risk") or "Low").strip()

    # Map risk label to lowercase severity expected by the DB
    severity_map = {"High": "high", "Medium": "medium", "Low": "low"}
    severity = severity_map.get(risk_label, "low")

    return {
        "risk_type":       r.get("framework", "General"),
        "severity":        severity,
        "confidence":      round(float(r.get("score", 0.0)), 4),
        "description":     r.get("matched_rule", "Compliance rule matched"),
        "evidence_snippet": r.get("clause", ""),
        "suggested_fix":   None,   # generated on-demand via /generate-fix
        "clause_id":       None,
        "policy_ref_id":   None,
    }


# =============================================================================
# POST /analyze
# Accepts a Supabase file URL or a local file path, runs the new NLP pipeline,
# and returns structured findings.
# =============================================================================
@app.post("/analyze")
async def analyze_doc(request: AnalyzeRequest):
    is_url = request.file_path.startswith("http")
    temp_file_path = None
    target_path = request.file_path

    # ── Download file if it's a remote URL ──────────────────────────────────
    if is_url:
        resp = requests.get(request.file_path, timeout=60)
        if resp.status_code != 200:
            return {"error": f"Failed to download file from {request.file_path}"}

        ext = os.path.splitext(request.file_path.split("?")[0])[1] or ".pdf"
        fd, temp_file_path = tempfile.mkstemp(suffix=ext)
        with os.fdopen(fd, "wb") as f:
            f.write(resp.content)
        target_path = temp_file_path

    elif not os.path.exists(target_path):
        return {"error": f"File not found at {target_path}"}

    try:
        # ── Extract text ─────────────────────────────────────────────────────
        print(f"📄 Extracting text from: {target_path}")
        with open(target_path, "rb") as f:
            file_bytes = BytesIO(f.read())
        text = extract_text_from_pdf(file_bytes)

        if not text.strip():
            return {"error": "Could not extract text from document. Ensure it is a readable PDF."}

        # ── Run new AI engine ─────────────────────────────────────────────────
        print(f"🤖 Running new AI Engine audit for doc_id={request.doc_id} ...")
        raw_results = run_audit(text)
        print(f"📊 AI Engine returned {len(raw_results)} raw findings.")

        # ── Filter out safe (Low-risk) clauses to keep findings meaningful ────
        # Only report High and Medium risk findings to avoid flooding the DB.
        risky_results = [r for r in raw_results if (r.get("risk") or "").strip() in ("High", "Medium")]

        # If everything is low risk, still return at least the top-scored ones
        if not risky_results:
            risky_results = raw_results[:10]

        mapped_findings = [_map_result(r) for r in risky_results]

        # ── Generate report filename (placeholder path) ───────────────────────
        report_filename = f"report_{request.doc_id}.pdf"

        print(f"✅ Returning {len(mapped_findings)} findings for doc_id={request.doc_id}")

    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)

    return {
        "doc_id":     request.doc_id,
        "findings":   mapped_findings,
        "report_url": f"/download-report/{report_filename}",
    }


# =============================================================================
# POST /generate-fix
# On-demand AI remediation via OpenRouter (Gemini).
# Called by findings.controller.js → nlp.service.generateFixSuggestion()
# =============================================================================
def _call_openrouter(clause: str, explanation: str) -> str:
    if not OPENROUTER_API_KEY:
        return "Please configure OPENROUTER_API_KEY to enable AI remediation suggestions."

    prompt = (
        "You are a legal compliance expert.\n"
        "The following legal clause has been flagged as a compliance risk.\n\n"
        f'Original Clause: "{clause}"\n'
        f"Risk / Explanation: {explanation}\n\n"
        "Please provide a professional, legally compliant 'Sample Compliant Clause' that remediates "
        "the identified risk while preserving the original intent where possible.\n"
        "Respond with the replacement clause text only — no preamble, no explanation."
    )

    max_retries = 5
    base_delay = 5

    for attempt in range(max_retries):
        try:
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY.strip()}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-OpenRouter-Title": "Sentinel Law AI",
                },
                data=json.dumps({
                    "model": "google/gemini-2.0-flash-lite-001",
                    "messages": [{"role": "user", "content": prompt}],
                }),
                timeout=30,
            )

            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"].strip()

            if response.status_code == 429 and attempt < max_retries - 1:
                delay = base_delay * (2 ** attempt)
                print(f"⚠️  Rate limit (429). Retrying in {delay}s … (attempt {attempt + 1})")
                time.sleep(delay)
                continue

            error_body = response.json() if response.content else {}
            msg = error_body.get("error", {}).get("message", "Unknown error")
            return f"AI Generation Failed ({response.status_code}): {msg}"

        except Exception as exc:
            if attempt < max_retries - 1:
                time.sleep(base_delay)
                continue
            return f"Remediation error: {exc}"

    return "Remediation generation failed after multiple attempts."


@app.post("/generate-fix")
async def generate_fix(request: FixRequest):
    """Generate an AI-powered compliant replacement clause for a flagged finding."""
    print("✨ Generating on-demand AI remediation …")
    suggestion = _call_openrouter(request.clause, request.explanation)
    return {"suggested_fix": suggestion}


# =============================================================================
# GET /download-report/{filename}
# Serve a previously generated PDF report.
# =============================================================================
@app.get("/download-report/{filename}")
def download_report(filename: str):
    file_path = filename
    if not os.path.exists(file_path):
        return {"error": "Report not found."}

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/pdf",
    )


# =============================================================================
# ENTRY POINT
# =============================================================================
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)