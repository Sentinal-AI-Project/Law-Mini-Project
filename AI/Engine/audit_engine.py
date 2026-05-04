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
    """
    Calculates a weighted compliance score.
    Low Risk/No Match = 100% compliant
    Medium Risk = 50% compliant
    High Risk = 0% compliant
    """
    if not results:
        return 100.0
        
    total = len(results)
    compliant_points = 0
    
    for r in results:
        risk = r.get("risk", "Low")
        if risk == "High":
            compliant_points += 0
        elif risk == "Medium":
            compliant_points += 0.5
        else:
            compliant_points += 1
            
    return round((compliant_points / total) * 100, 2)