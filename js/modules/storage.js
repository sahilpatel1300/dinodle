const STORAGE_KEY = 'dinodle_state';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    // Only persist what's needed to restore currentGuess is intentionally omitted.
    const toSave = {
      dayIndex: state.dayIndex,
      puzzleNumber: state.puzzleNumber,
      answer: state.answer,
      guesses: state.guesses,
      evaluatedRows: state.evaluatedRows,
      letterStates: state.letterStates,
      gameState: state.gameState,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Storage full or disabled fail silently.
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
