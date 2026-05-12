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


def keep_metadata(dino: dict) -> dict:
    clean_dino = {}

    for key in METADATA_KEYS:
        clean_dino[key] = dino.get(key)

    return clean_dino


def get_name(dino: dict) -> str:
    return dino["name"]


def main():
    with INPUT_FILE.open("r", encoding="utf-8") as file:
        dinos = json.load(file)

    unique_dinos_by_name = {}

    for dino in dinos:
        raw_name = dino.get(NAME_KEY, "")
        name = clean_name(raw_name)

        if not name:
            continue

        if name not in unique_dinos_by_name:
            clean_dino = keep_metadata(dino)
            clean_dino["name"] = name
            clean_dino["word_length"] = len(name)

            unique_dinos_by_name[name] = clean_dino

    dinos_by_length = defaultdict(list)

    for dino in unique_dinos_by_name.values():
        word_length = dino["word_length"]
        dinos_by_length[word_length].append(dino)

    grouped_dinos = {}

    for length, dinos in sorted(dinos_by_length.items()):
        sorted_dinos = sorted(dinos, key=get_name)
        grouped_dinos[str(length)] = sorted_dinos

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    output_json = DATA_DIR / f"dinosaur_metadata_by_len_{timestamp}.json"
    output_chart = DATA_DIR / f"dinosaur_metadata_by_len_{timestamp}.png"

    with output_json.open("w", encoding="utf-8") as file:
        json.dump(grouped_dinos, file, indent=2)

    lengths = []
    counts = []

    for length, dinos in grouped_dinos.items():
        lengths.append(int(length))
        counts.append(len(dinos))

    plt.figure(figsize=(10, 6))
    plt.bar(lengths, counts)
    plt.xlabel("Name Length")
    plt.ylabel("Number of Unique Dinosaur Names")
    plt.title("Unique Dinosaur Names by Length")
    plt.xticks(lengths)
    plt.tight_layout()
    plt.savefig(output_chart)
    plt.close()

    print(f"Found {len(unique_dinos_by_name)} unique dinosaur names")
    print(f"Wrote JSON: {output_json}")
    print(f"Wrote chart: {output_chart}")


if __name__ == "__main__":
    main()