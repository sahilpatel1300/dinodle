import { getTodayDino, getDayIndexEST, getPuzzleNumber } from './modules/wordSelector.js';
import {
  evaluateGuess, isWin, generateShareText,
  MAX_GUESSES, WORD_LENGTH, STATE_PRIORITY,
} from './modules/gameLogic.js';
import { loadState, saveState } from './modules/storage.js';
import {
  initBoard, initKeyboard, renderBoard, renderKeyboard,
  updateCurrentRow, revealRow, shakeRow, bounceRow,
  showToast, showWinCelebration,
} from './modules/ui.js';
import { showDinoModal, copyToClipboard } from './modules/modal.js';

// ─── Game state ──────────────────────────────────────────────────────────────

let state = {
  answer: '',
  todayDino: null,
  guesses: [],
  evaluatedRows: [],
  letterStates: {},
  currentGuess: '',
  gameState: 'in_progress',
  dayIndex: 0,
  puzzleNumber: 1,
};

/** Blocks input during animations. */
let inputLocked = false;

// ─── Initialisation ──────────────────────────────────────────────────────────

function init() {
  const todayDino = getTodayDino();
  const todayDayIndex = getDayIndexEST();
  const todayPuzzleNumber = getPuzzleNumber();
  const saved = loadState();

  if (saved && saved.dayIndex === todayDayIndex) {
    // Restore today's session.
    Object.assign(state, saved, { todayDino, currentGuess: '' });
  } else {
    // Fresh game (new day or first ever visit).
    Object.assign(state, {
      answer: todayDino.name.toUpperCase(),
      todayDino,
      guesses: [],
      evaluatedRows: [],
      letterStates: {},
      currentGuess: '',
      gameState: 'in_progress',
      dayIndex: todayDayIndex,
      puzzleNumber: todayPuzzleNumber,
    });
    saveState(state);
  }

  initBoard(MAX_GUESSES, WORD_LENGTH);
  initKeyboard(handleKey);

  if (state.guesses.length > 0) {
    renderBoard(state.guesses, state.evaluatedRows);
    renderKeyboard(state.letterStates);
  }

  if (state.gameState !== 'in_progress') {
    inputLocked = true;
    revealShareButton();
    // Brief delay so the board paints before the modal appears.
    setTimeout(() => openDossier(), 600);
  }

  // Physical keyboard
  document.addEventListener('keydown', onKeydown);

  // Help button
  document.getElementById('btn-help').addEventListener('click', () => {
    document.getElementById('modal-help').classList.remove('hidden');
  });

  // Header share button
  document.getElementById('btn-share-header').addEventListener('click', () => {
    copyToClipboard(buildShareText(), document.getElementById('btn-share-header'));
  });

  // Modal close buttons & overlay-click dismissal
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-modal');
      document.getElementById(id).classList.add('hidden');
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.add('hidden');
    });
  });
}

// ─── Input handling ──────────────────────────────────────────────────────────

function onKeydown(e) {
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.key === 'Enter') handleKey('ENTER');
  else if (e.key === 'Backspace') handleKey('\u232B');
  else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
}

function handleKey(key) {
  if (inputLocked || state.gameState !== 'in_progress') return;

  if (key === 'ENTER') {
    submitGuess();
  } else if (key === '\u232B') {
    if (state.currentGuess.length > 0) {
      state.currentGuess = state.currentGuess.slice(0, -1);
      updateCurrentRow(state.guesses.length, state.currentGuess);
    }
  } else if (/^[A-Z]$/.test(key)) {
    if (state.currentGuess.length < WORD_LENGTH) {
      state.currentGuess += key;
      updateCurrentRow(state.guesses.length, state.currentGuess);
    }
  }
}

// ─── Guess submission ────────────────────────────────────────────────────────

function submitGuess() {
  if (state.currentGuess.length < WORD_LENGTH) {
    shakeRow(state.guesses.length);
    showToast('Not enough letters');
    return;
  }

  const guess = state.currentGuess;
  const evaluated = evaluateGuess(guess, state.answer);
  const rowIndex = state.guesses.length;

  inputLocked = true;
  state.guesses.push(guess);
  state.evaluatedRows.push(evaluated);

  // Update keyboard letter states — higher priority wins.
  evaluated.forEach(({ letter, state: s }) => {
    const current = state.letterStates[letter];
    if (!current || STATE_PRIORITY[s] > STATE_PRIORITY[current]) {
      state.letterStates[letter] = s;
    }
  });

  revealRow(rowIndex, evaluated, () => {
    renderKeyboard(state.letterStates);

    const won = isWin(evaluated);

    if (won) {
      state.gameState = 'won';
      saveState(state);
      bounceRow(rowIndex);
      showWinCelebration();
      const msg = ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!', 'Survived!'];
      showToast(msg[rowIndex] ?? 'Nice!', 1500);
      setTimeout(() => {
        revealShareButton();
        openDossier();
      }, 1800);

    } else if (state.guesses.length >= MAX_GUESSES) {
      state.gameState = 'lost';
      saveState(state);
      showToast(state.answer, 3500);
      setTimeout(() => {
        revealShareButton();
        openDossier();
      }, 3700);

    } else {
      saveState(state);
      state.currentGuess = '';
      inputLocked = false;
    }
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildShareText() {
  return generateShareText(
    state.evaluatedRows,
    state.gameState === 'won',
    state.puzzleNumber,
    MAX_GUESSES,
  );
}

function openDossier() {
  showDinoModal(state.todayDino, state.gameState === 'won', buildShareText());
}

function revealShareButton() {
  document.getElementById('btn-share-header').classList.remove('hidden');
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────
init();
