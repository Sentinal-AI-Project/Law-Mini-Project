from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
import os

from audit_pipeline import audit_pipeline  # 👈 import your pipeline

app = FastAPI()

@app.get("/")
def home():
    return {"message": "API running 🚀"}


@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.filename)

    # Save file
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # 🔥 CALL YOUR PIPELINE
    results = audit_pipeline(file_path)

    return {
        "filename": file.filename,
        "file_path": file_path,
        "results": results
    }


# ✅ NEW ENDPOINT: Download report
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