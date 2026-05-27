"""
Prints the full Dinodle puzzle order — every dinosaur, every date.
Run from the repo root:  python scripts/cheat_sheet.py
"""

import json, ctypes, math, datetime, pathlib

REPO = pathlib.Path(__file__).parent.parent

# ── Replicate JS mulberry32 PRNG exactly ────────────────────────────────────

def make_mulberry32(seed):
    state = [ctypes.c_int32(seed).value]

    def _imul(a, b):
        return ctypes.c_int32(ctypes.c_int32(a).value * ctypes.c_int32(b).value).value

    def _u32(x):
        return x & 0xFFFFFFFF

    def rand():
        s = ctypes.c_int32(state[0] + 0x6D2B79F5).value
        state[0] = s
        t = _imul(s ^ (_u32(s) >> 15), 1 | s)
        t = ctypes.c_int32(t + _imul(t ^ (_u32(t) >> 7), 61 | t)).value
        return _u32(t ^ (_u32(t) >> 14)) / 4294967296

    return rand


def seeded_shuffle(arr, seed):
    a = list(arr)
    rand = make_mulberry32(seed)
    for i in range(len(a) - 1, 0, -1):
        j = math.floor(rand() * (i + 1))
        a[i], a[j] = a[j], a[i]
    return a


# ── Load & shuffle ───────────────────────────────────────────────────────────

src = REPO / "visuals_and_data" / "wordle_words_len_10.json"
data = json.loads(src.read_text(encoding="utf-8"))
names = sorted(d["name"] for d in data if d.get("word_length") == 10)

SHUFFLE_SEED = 20260512
shuffled = seeded_shuffle(names, SHUFFLE_SEED)

# ── Date arithmetic (mirror JS: EST = UTC-5, fixed) ──────────────────────────

EST_OFFSET = 5 * 3600  # seconds

def day_index(dt_utc: datetime.datetime) -> int:
    return int((dt_utc.timestamp() - EST_OFFSET) // 86400)

def day_index_to_date(idx: int) -> datetime.date:
    # Day index is the UTC calendar day number, so multiply back to get UTC midnight.
    ts = idx * 86400
    return datetime.datetime.fromtimestamp(ts, tz=datetime.timezone.utc).date()

# LAUNCH_IDX must match getDayIndexEST() on May 26 EST, which equals the UTC calendar
# day number for May 26 (the EST offset cancels out in getDayIndexEST).
LAUNCH = datetime.datetime(2026, 5, 26, tzinfo=datetime.timezone.utc)
LAUNCH_IDX = int(LAUNCH.timestamp() // 86400)
TODAY_IDX  = day_index(datetime.datetime.now(datetime.timezone.utc))

# ── Print ────────────────────────────────────────────────────────────────────

print(f"{'#':<5}  {'Date':<14}  Dinosaur")
print("-" * 42)

for i, name in enumerate(shuffled):
    puzzle_no = i + 1
    date = day_index_to_date(LAUNCH_IDX + i)
    marker = "  <-- TODAY" if (LAUNCH_IDX + i) == TODAY_IDX else ""
    print(f"#{puzzle_no:<4}  {str(date):<14}  {name}{marker}")
