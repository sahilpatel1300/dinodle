"""
Reads visuals_and_data/wordle_words_len_10.json and writes
js/frontend_data/dinosaurs.js as an ES module export.

Run from the repo root:
    python scripts/generate_dinosaurs_js.py
"""

import json
import pathlib

REPO_ROOT = pathlib.Path(__file__).parent.parent
SOURCE = REPO_ROOT / "visuals_and_data" / "wordle_words_len_10.json"
OUTPUT = REPO_ROOT / "js" / "frontend_data" / "dinosaurs.js"

KEEP_FIELDS = ["name", "diet", "type", "length_m", "max_ma", "min_ma", "region", "class", "family"]


def js_value(v):
    """Convert a Python value to its JavaScript literal representation."""
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    # String: escape backslashes and double-quotes, encode as double-quoted JS string.
    escaped = str(v).replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def entry_to_js(dino: dict) -> str:
    parts = ", ".join(f'{k}: {js_value(dino.get(k))}' for k in KEEP_FIELDS)
    return f"  {{ {parts} }}"


def main():
    with SOURCE.open(encoding="utf-8") as fh:
        data = json.load(fh)

    # Filter to only 10-letter entries (future-proofs if the JSON ever gains other lengths)
    entries = [d for d in data if d.get("word_length") == 10]
    entries.sort(key=lambda d: d["name"].upper())

    lines = ["export const DINOSAUR_LIST = ["]
    for i, dino in enumerate(entries):
        comma = "," if i < len(entries) - 1 else ""
        lines.append(entry_to_js(dino) + comma)
    lines.append("];\n")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Written {len(entries)} entries to {OUTPUT.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
