from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import os
from datetime import datetime

# 📁 folder to store reports
REPORT_DIR = "reports"
os.makedirs(REPORT_DIR, exist_ok=True)


def get_timestamp():
    return datetime.now().strftime("%Y%m%d_%H%M%S")


# 🎨 Risk color helper
def get_risk_color(risk):
    if risk == "High":
        return "red"
    elif risk == "Medium":
        return "orange"
    else:
        return "green"


# =========================
# 📄 DETAILED REPORT
# =========================
def generate_pdf_report(results):
    filename = f"detailed_{get_timestamp()}.pdf"
    filepath = os.path.join(REPORT_DIR, filename)

    doc = SimpleDocTemplate(filepath)
    styles = getSampleStyleSheet()

    content = []

    # Title
    content.append(Paragraph("<b>Compliance Audit Report</b>", styles["Title"]))
    content.append(Spacer(1, 20))

    # 📊 Stats
    total = len(results)
    high = len([r for r in results if r["risk"] == "High"])
    medium = len([r for r in results if r["risk"] == "Medium"])
    low = len([r for r in results if r["risk"] == "Low"])

    content.append(Paragraph(f"<b>Total Clauses:</b> {total}", styles["Normal"]))
    content.append(Paragraph(f"<font color='red'><b>High Risk:</b> {high}</font>", styles["Normal"]))
    content.append(Paragraph(f"<font color='orange'><b>Medium Risk:</b> {medium}</font>", styles["Normal"]))
    content.append(Paragraph(f"<font color='green'><b>Low Risk:</b> {low}</font>", styles["Normal"]))

    content.append(Spacer(1, 20))

    # 📄 Clauses
    for i, r in enumerate(results, 1):
        color = get_risk_color(r["risk"])

        content.append(Paragraph(f"<b>Clause {i}:</b> {r['clause']}", styles["Normal"]))
        content.append(Paragraph(f"<b>Framework:</b> {r['framework']}", styles["Normal"]))
        content.append(Paragraph(f"<font color='{color}'><b>Risk:</b> {r['risk']}</font>", styles["Normal"]))
        content.append(Paragraph(f"<b>Score:</b> {r['score']}", styles["Normal"]))

        content.append(Spacer(1, 15))

    doc.build(content)

    return filename


# =========================
# ⚡ SUMMARY REPORT (ONLY HIGH + MEDIUM)
# =========================
def generate_summary_report(results):
    filename = f"summary_{get_timestamp()}.pdf"
    filepath = os.path.join(REPORT_DIR, filename)

    doc = SimpleDocTemplate(filepath)
    styles = getSampleStyleSheet()

    content = []

    high_risks = [r for r in results if r["risk"] == "High"]
    medium_risks = [r for r in results if r["risk"] == "Medium"]

    # Title
    content.append(Paragraph("<b>Quick Compliance Summary</b>", styles["Title"]))
    content.append(Spacer(1, 20))

    # Stats
    content.append(Paragraph(f"<font color='red'><b>High Risk Clauses: {len(high_risks)}</b></font>", styles["Normal"]))
    content.append(Paragraph(f"<font color='orange'><b>Medium Risk Clauses: {len(medium_risks)}</b></font>", styles["Normal"]))

    content.append(Spacer(1, 20))

    # 🔴 High Risk Section
    content.append(Paragraph("<font color='red'><b>High Risk Clauses</b></font>", styles["Heading2"]))
    content.append(Spacer(1, 10))

    for r in high_risks:
        content.append(Paragraph(r["clause"], styles["Normal"]))
        content.append(Spacer(1, 10))

    # 🟠 Medium Risk Section
    content.append(Spacer(1, 15))
    content.append(Paragraph("<font color='orange'><b>Medium Risk Clauses</b></font>", styles["Heading2"]))
    content.append(Spacer(1, 10))

    for r in medium_risks:
        content.append(Paragraph(r["clause"], styles["Normal"]))
        content.append(Spacer(1, 10))

    doc.build(content)

    return filename