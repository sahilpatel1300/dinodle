import { DINOSAUR_LIST } from '../frontend_data/dinosaurs.js';

const SHUFFLE_SEED = 20260512;

// Launch date: May 26, 2026.
// getDayIndexEST() returns Math.floor(utcMs / 86400000) after subtracting the 5h offset,
// which equals the UTC calendar day index. Using Date.UTC / 86400000 (no offset) matches that.
const LAUNCH_DAY_INDEX = Math.floor(Date.UTC(2026, 4, 26) / 86400000);

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(arr, seed) {
  const a = [...arr];
  const rand = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SHUFFLED_LIST = seededShuffle(DINOSAUR_LIST, SHUFFLE_SEED);

export function getDayIndexEST() {
  return Math.floor((Date.now() - 5 * 3600 * 1000) / 86400000);
}

export function getTodayDino() {
  // Offset from launch day so puzzle #1 = SHUFFLED_LIST[0] on launch day,
  // puzzle #2 = SHUFFLED_LIST[1] the next day, etc.
  const offset = ((getDayIndexEST() - LAUNCH_DAY_INDEX) % SHUFFLED_LIST.length + SHUFFLED_LIST.length) % SHUFFLED_LIST.length;
  return SHUFFLED_LIST[offset];
}

export function getPuzzleNumber() {
  return Math.max(1, getDayIndexEST() - LAUNCH_DAY_INDEX + 1);
}
