import json
from pathlib import Path



ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"

INPUT_FILE = DATA_DIR / "dinosaur_metadata_by_len.json"
OUTPUT_FILE = DATA_DIR / "wordle_words_len_10.json"

TARGET_LENGTH = 10


def main():
    with INPUT_FILE.open("r", encoding= "utf-8") as file:
        dinos_by_length = json.load(file)

    length_key = str(TARGET_LENGTH)

    length_10_dinos = dinos_by_length.get(length_key, [])
    
    with OUTPUT_FILE.open("w", encoding = "utf-8") as file:
        json.dump(length_10_dinos, file, indent = 4)

    print(f"Found {len(length_10_dinos)} dinosaurs with length {TARGET_LENGTH}")
    print(f"Wrote {OUTPUT_FILE}")


if __name__ == "__main__":
    main()