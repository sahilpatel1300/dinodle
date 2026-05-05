import pandas as pd
import json
from pathlib import Path


root = Path(__file__).resolve().parent.parent

input_path = root / "data" / "dinosaurs.csv"
output_path = root / "data" / "dinosaurs.json"

df = pd.read_csv(input_path)
df.to_json(output_path, orient="records", indent = 4 )

print(f"Wrote {len(df)} rows to {output_path}")
