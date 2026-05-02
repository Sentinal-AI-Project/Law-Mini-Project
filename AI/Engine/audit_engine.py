from AI.Engine.rule_loader import load_all_rules
from AI.Engine.embedding_engine import compute_rule_embeddings
from AI.Engine.clause_engine import segment_clauses, match_clause


def run_audit(text):
    rules = load_all_rules()
    rule_embeddings = compute_rule_embeddings(rules)

    clauses = segment_clauses(text)

    results = []

    for clause in clauses:
        result = match_clause(clause, rules, rule_embeddings)
        results.append(result)

    return results
def calculate_compliance_score(results):
    score = 100

    for r in results:
        if r["risk"] == "High":
            score -= 3
        elif r["risk"] == "Medium":
            score -= 2
        else:
            score -= 1

    return max(score, 0)