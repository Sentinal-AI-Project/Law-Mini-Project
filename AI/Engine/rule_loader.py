import json
import os

# Absolute path to the data directory, resolved relative to this file.
# This ensures rules load correctly regardless of the working directory.
DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")


def load_json(file_name):
    full_path = os.path.join(DATA_PATH, file_name)
    with open(full_path, "r") as f:
        return json.load(f)


def load_all_rules():
    gdpr  = load_json("gdpr_rules.json")
    soc2  = load_json("SOC2_rules.json")
    hipaa = load_json("HIPAA_rules.json")
    iso   = load_json("ISO_rules.json")
    cuad  = load_json("CUAD_rules.json")

    all_rules = gdpr + soc2 + hipaa + iso + cuad

    print(f"✅ Total Rules Loaded: {len(all_rules)}")
    return all_rules