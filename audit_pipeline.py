import pdfplumber
import spacy
import json
import re
import os
import torch
from sentence_transformers import SentenceTransformer, util
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

# =========================
# 🔹 LOAD MODELS
# =========================
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer('all-MiniLM-L6-v2')

# =========================
# 🔹 ENRICH RULE
# =========================
def enrich_rule(clause):
    doc = nlp(clause)

    keywords = []
    for token in doc:
        if token.pos_ in ["NOUN", "VERB", "PROPN"]:
            word = token.text.lower()
            if len(word) > 4:
                keywords.append(word)

    keywords = list(set(keywords))
    required_terms = keywords[:3]

    return keywords, required_terms


# =========================
# 🔹 NEW: KEYWORD OVERLAP
# =========================
def get_overlap(clause, rule):
    clause_words = set(clause.lower().split())
    rule_words = set(rule.lower().split())
    overlap = clause_words.intersection(rule_words)
    return list(overlap)[:5]


# =========================
# 🔹 LOAD CUAD RULES (CACHED)
# =========================
def load_cuad_rules(cuad_path="CUAD_v1.json"):

    if os.path.exists("cuad_rules_cache.json"):
        print("⚡ Loading cached CUAD rules...")
        with open("cuad_rules_cache.json", "r") as f:
            return json.load(f)

    print("⏳ Processing CUAD (first time only)...")

    with open(cuad_path, "r") as f:
        data = json.load(f)

    clauses = []

    for item in data["data"]:
        for para in item["paragraphs"]:
            for qa in para["qas"]:
                for ans in qa["answers"]:
                    text = ans["text"].strip()
                    if text and len(text) > 40:
                        clauses.append(text)

    clauses = list(set(clauses))
    clauses = clauses[:3000]

    rules = []
    for i, clause in enumerate(clauses):
        keywords, required_terms = enrich_rule(clause)

        rules.append({
            "rule_id": f"cuad_{i}",
            "law": "CUAD",
            "description": clause,
            "keywords": keywords,
            "required_terms": required_terms,
            "severity": "Medium"
        })

    with open("cuad_rules_cache.json", "w") as f:
        json.dump(rules, f)

    print("✅ Total CUAD rules loaded:", len(rules))
    return rules


# =========================
# 🔹 CACHE EMBEDDINGS
# =========================
def get_rule_embeddings(all_rules):

    if os.path.exists("rule_embeddings.pt") and os.path.exists("cuad_rules_cache.json"):
        print("⚡ Loading cached embeddings...")
        return torch.load("rule_embeddings.pt")

    print("⏳ Computing embeddings (one-time)...")

    rule_texts = [r["description"] for r in all_rules]
    embeddings = model.encode(rule_texts, convert_to_tensor=True)

    torch.save(embeddings, "rule_embeddings.pt")
    return embeddings


# =========================
# 🔹 PDF → TEXT
# =========================
def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += (page.extract_text() or "") + "\n"
    return text


# =========================
# 🔹 TEXT → CLAUSES
# =========================
def segment_clauses(text):
    text = text.replace("\n", ". ")
    doc = nlp(text)
    return [sent.text.strip() for sent in doc.sents if len(sent.text.strip()) > 20]


# =========================
# 🔹 CUSTOM RULES
# =========================
def get_custom_rules(policy_text):
    clauses = segment_clauses(policy_text)

    rules = []
    for i, clause in enumerate(clauses):
        keywords, required_terms = enrich_rule(clause)

        rules.append({
            "rule_id": f"custom_{i}",
            "law": "Company Policy",
            "description": clause,
            "keywords": keywords,
            "required_terms": required_terms,
            "severity": "Medium"
        })

    return rules


# =========================
# 🔹 MAIN AUDIT FUNCTION
# =========================
def run_audit(contract_path, policy_path=None):

    cuad_rules = load_cuad_rules()

    custom_rules = []
    if policy_path:
        policy_text = extract_text_from_pdf(policy_path)
        custom_rules = get_custom_rules(policy_text)

    all_rules = cuad_rules + custom_rules

    print("✅ Total rules used:", len(all_rules))

    rule_embeddings = get_rule_embeddings(all_rules)

    contract_text = extract_text_from_pdf(contract_path)
    clauses = segment_clauses(contract_text)

    print("✅ Total clauses found:", len(clauses))

    results = []

    for clause in clauses:

        if len(clause.split()) < 5:
            continue

        clause_embedding = model.encode([clause], convert_to_tensor=True)[0]
        scores = util.cos_sim(clause_embedding, rule_embeddings)[0]

        top_k = 5
        top_results = scores.topk(top_k)

        best_idx = top_results.indices[0].item()
        best_score = top_results.values[0].item()

        rule = all_rules[best_idx]
        matched_rule_text = rule["description"]

        overlap_words = get_overlap(clause, matched_rule_text)

        # 🔹 Confidence label
        if best_score > 0.75:
            confidence_label = "High confidence match"
        elif best_score > 0.5:
            confidence_label = "Moderate confidence"
        else:
            confidence_label = "Low confidence"

        # 🔹 RAG-style explanation
        if best_score < 0.4:
            risk = True
            explanation = f"""
This clause is flagged as HIGH RISK.

Clause:
"{clause}"

Relevant Policy:
"{matched_rule_text}"

Reason:
The clause significantly deviates from standard legal clauses and may introduce compliance issues.
"""

        elif best_score < 0.6:
            risk = True
            explanation = f"""
This clause is flagged as MEDIUM RISK.

Clause:
"{clause}"

Relevant Policy:
"{matched_rule_text}"

Reason:
The clause partially aligns with known policies but lacks clarity or completeness.
"""

        else:
            risk = False
            explanation = f"""
This clause is SAFE.

Clause:
"{clause}"

Matched Policy:
"{matched_rule_text}"

Reason:
The clause closely matches standard legal language and appears compliant.
"""

        # 🔥 Special rule
        if ("share" in clause.lower() and "data" in clause.lower() 
            and "consent" not in clause.lower()):
            risk = True
            explanation = f"""
🚨 DATA PRIVACY RISK DETECTED

Clause:
"{clause}"

Issue:
Data is being shared without explicit user consent.

Impact:
This may violate data protection regulations.

Suggestion:
Add a clear user consent clause before data sharing.
"""

        if ("between" in clause.lower() and "and" in clause.lower()):
            risk = False

        if best_score > 0.75:
            risk = False

        # 🔹 Severity
        if best_score < 0.4:
            severity = "High"
        elif best_score < 0.6:
            severity = "Medium"
        else:
            severity = "Low"

        # 🔹 Add overlap + confidence
        explanation += f"\nKey matching terms: {', '.join(overlap_words)}"
        explanation += f"\nConfidence Level: {confidence_label}"

        results.append({
            "clause": clause,
            "law": rule["law"],
            "severity": severity,
            "confidence": round(best_score, 2),
            "risk": risk,
            "explanation": explanation
        })

    return results


# =========================
# 🔹 REPORT
# =========================
def generate_report(results):
    report = "COMPLIANCE AUDIT REPORT\n\n"

    risks = [r for r in results if r["risk"]]

    report += f"Total Clauses: {len(results)}\n"
    report += f"Risks Found: {len(risks)}\n\n"

    report += "RISK DETAILS\n\n"
    for r in risks:
        report += f"{r['clause']}\n"
        report += f"→ {r['explanation']}\n\n"

    report += "\nSAFE CLAUSES\n\n"
    for r in results:
        if not r["risk"]:
            report += f"{r['clause']}\n\n"

    return report


# =========================
# 🔹 SAVE PDF
# =========================
def save_pdf(report_text, filename="audit_report.pdf"):
    doc = SimpleDocTemplate(filename)
    styles = getSampleStyleSheet()

    content = []
    for line in report_text.split("\n"):
        content.append(Paragraph(line, styles["Normal"]))
        content.append(Spacer(1, 10))

    doc.build(content)


# =========================
# 🔹 PIPELINE
# =========================
def audit_pipeline(contract_path, policy_path=None, report_filename="audit_report.pdf"):
    results = run_audit(contract_path, policy_path)
    report = generate_report(results)
    save_pdf(report, filename=report_filename)
    return results