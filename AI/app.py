from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from io import BytesIO
import os
from AI.Engine.audit_engine import run_audit, calculate_compliance_score
from AI.Engine.audit_engine import run_audit
from AI.services.pdf_services import extract_text_from_pdf   # ✅ fixed name
from AI.services.report_service import generate_pdf_report, generate_summary_report

app = FastAPI()


@app.get("/")
def home():
    return {"message": "Sentinel AI running 🚀"}


# =========================
# 📤 ANALYZE FILE
# =========================
@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    content = await file.read()

    # 📄 Handle file types
    if file.filename.endswith(".pdf"):
        text = extract_text_from_pdf(BytesIO(content))
    else:
        text = content.decode("utf-8", errors="ignore")

    # 🤖 Run AI audit
    results = run_audit(text)

    # 📑 Generate UNIQUE reports (no filename passed now)
    detailed_report = generate_pdf_report(results)
    summary_report = generate_summary_report(results)

    score = calculate_compliance_score(results)

    return JSONResponse({
        "message": "Reports generated successfully",
        "detailed_report": detailed_report,
        "summary_report": summary_report,
        "total_clauses": len(results),
        "compliance_score": score
})


# =========================
# 📥 DOWNLOAD ANY REPORT (DYNAMIC)
# =========================
@app.get("/download/{filename}")
def download_file(filename: str):
    file_path = os.path.join("reports", filename)

    if os.path.exists(file_path):
        return FileResponse(
            file_path,
            media_type="application/pdf",
            filename=filename
        )

    return {"error": "File not found"}