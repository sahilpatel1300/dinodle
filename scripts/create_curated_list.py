from collections import defaultdict
from datetime import datetime
import json
from pathlib import Path

import matplotlib.pyplot as plt


ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"

INPUT_FILE = DATA_DIR / "dinosaurs.json"

NAME_KEY = "name"

METADATA_KEYS = [
    "name",
    "diet",
    "type",
    "length_m",
    "max_ma",
    "min_ma",
    "region",
    "class",
    "family",
]


def clean_name(name: str) -> str:
    return name.strip()

def save_metadata(dino: dict) -> dict:
    clean_dino = {}

    for key in METADATA_KEYS: 
        clean_dino[key] = dino.get(key)

    return clean_dino

def main():
    # open file
    with INPUT_FILE.open("r", encoding="utf-8") as file:
        dinos = json.load(file)

    # Use a dict to dedupe list of dino
    unique_dinos_by_name = {}


    for dino in dinos:
        name = clean_name(dino.get(NAME_KEY, ""))

        if not name:
            continue

        # check if in unique list
        if name not in unique_dinos_by_name:
            clean_dino = save_metadata(dino)
            clean_dino["name"] = name
            clean_dino["word_length"] = len(name)

            # add to dict
            unique_dinos_by_name[name] = clean_dino
    # dict to key by length
    dinos_by_length = defaultdict(list)

    for dino in unique_dinos_by_name.values():
        word_length = dino["word_length"]
        dinos_by_length[word_length].append(dino)





if __name__ == "__main__": 
    main()