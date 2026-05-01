import spacy
from sentence_transformers import util
from AI.Engine.embedding_engine import model   # ✅ fixed import

# Load NLP model
nlp = spacy.load("en_core_web_sm")


def segment_clauses(text):
    doc = nlp(text)

    clauses = [
        sent.text.strip()
        for sent in doc.sents
        if len(sent.text.strip()) > 20
    ]

    return clauses


def match_clause(clause, rules, rule_embeddings):
    clause_embedding = model.encode([clause], convert_to_tensor=True)[0]

    scores = util.cos_sim(clause_embedding, rule_embeddings)[0]

    best_idx = scores.argmax().item()
    best_score = scores[best_idx].item()

    matched_rule = rules[best_idx]

    clause_text = clause.lower()

    # 🔥 SMART RISK LOGIC (important upgrade)

    # 🚨 High-risk patterns
    if (
        ("share" in clause_text and "data" in clause_text and "consent" not in clause_text)
        or ("without consent" in clause_text)
        or ("third party" in clause_text and "consent" not in clause_text)
    ):
        risk = "High"

    # 📊 Similarity-based fallback
    elif best_score > 0.75:
        risk = "Low"
    elif best_score > 0.5:
        risk = "Medium"
    else:
        risk = "High"

    return {
        "clause": clause,
        "matched_rule": matched_rule["description"],
        "framework": matched_rule["framework"],
        "score": round(best_score, 2),
        "risk": risk
    }