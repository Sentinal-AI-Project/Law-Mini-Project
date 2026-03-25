from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
import os

from audit_pipeline import audit_pipeline

app = FastAPI()

@app.get("/")
def home():
    return {"message": "API running 🚀"}


@app.post("/upload/")
async def upload_file(
    file: UploadFile = File(...),
    policy: UploadFile = File(None)   # 👈 OPTIONAL POLICY
):
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    # 🔹 Save contract file
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # 🔹 Save policy file (if provided)
    policy_path = None
    if policy:
        policy_path = os.path.join(upload_dir, policy.filename)
        with open(policy_path, "wb") as f:
            content = await policy.read()
            f.write(content)

    # 🔥 CALL PIPELINE (with or without policy)
    results = audit_pipeline(file_path, policy_path)

    return {
        "filename": file.filename,
        "file_path": file_path,
        "policy_used": policy.filename if policy else "No policy uploaded",
        "results": results,
        "report_download": "/download-report/"   # 👈 NEW LINK
    }


# ✅ DOWNLOAD REPORT
@app.get("/download-report/")
def download_report():
    file_path = "audit_report.pdf"

    if not os.path.exists(file_path):
        return {"error": "Report not found. Please upload a file first."}

    return FileResponse(
        path=file_path,
        filename="audit_report.pdf",
        media_type="application/pdf"
    )