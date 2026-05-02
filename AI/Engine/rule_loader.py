import json
import os

DATA_PATH = "AI/data"

def load_json(file_name):
    with open(os.path.join(DATA_PATH, file_name), "r") as f:
        return json.load(f)

def load_all_rules():
    gdpr = load_json("gdpr_rules.json")
    soc2 = load_json("SOC2_rules.json")
    hipaa = load_json("HIPAA_rules.json")
    iso = load_json("ISO_rules.json")
    cuad = load_json("CUAD_rules.json")

    all_rules = gdpr + soc2 + hipaa + iso + cuad

    print(f"✅ Total Rules Loaded: {len(all_rules)}")

    return all_rules