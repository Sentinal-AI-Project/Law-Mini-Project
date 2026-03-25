import re
import hashlib

# =========================
# 🔹 HASH FUNCTION
# =========================
def hash_text(text):
    return hashlib.sha256(text.encode()).hexdigest()[:10]


# =========================
# 🔹 DETECT PATTERNS
# =========================
def detect_sensitive_data(text):

    patterns = {
        "API_KEY": r"(?:api[_-]?key\s*=\s*['\"]?)([A-Za-z0-9\-_]{16,})",
        "URL": r"https?://[^\s]+",
        "EMAIL": r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
        "TOKEN": r"[A-Za-z0-9]{20,}",
    }

    findings = []

    for label, pattern in patterns.items():
        matches = re.findall(pattern, text)
        for match in matches:
            findings.append((label, match))

    return findings


# =========================
# 🔹 MASK / HASH
# =========================
def sanitize_text(text):

    findings = detect_sensitive_data(text)

    mapping = {}

    for label, value in findings:
        hashed = f"{label}_{hash_text(value)}"
        mapping[value] = hashed
        text = text.replace(value, hashed)

    return text, mapping


# =========================
# 🔹 TEST FUNCTION
# =========================
if __name__ == "__main__":

    sample = """
    API_KEY = sk-1234567890abcdef123456
    Visit https://example.com/api
    Contact admin@test.com
    Token: abcdefghijklmnopqrstuvwxyz123456
    """

    clean_text, mapping = sanitize_text(sample)

    print("🔹 CLEAN TEXT:\n", clean_text)
    print("\n🔹 MAPPING:\n", mapping)