from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"

model = SentenceTransformer(MODEL_NAME)
def compute_rule_embeddings(rules):
    texts = [r["description"] for r in rules]
    embeddings = model.encode(texts, convert_to_tensor=True)
    return embeddings