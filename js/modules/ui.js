const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '\u232B'],
];

// ─── Board ───────────────────────────────────────────────────────────────────

export function initBoard(maxGuesses, wordLength) {
  const board = document.getElementById('board');
  board.innerHTML = '';
  for (let r = 0; r < maxGuesses; r++) {
    const row = document.createElement('div');
    row.className = 'board-row';
    row.setAttribute('role', 'row');
    for (let c = 0; c < wordLength; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.setAttribute('data-state', 'empty');
      tile.setAttribute('role', 'cell');
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

/**
 * Renders all committed guesses onto the board without animation.
 * Used when restoring from localStorage on page load.
 */
export function renderBoard(guesses, evaluatedRows) {
  const rows = document.querySelectorAll('.board-row');
  guesses.forEach((guess, rowIndex) => {
    const tiles = rows[rowIndex].querySelectorAll('.tile');
    evaluatedRows[rowIndex].forEach((cell, i) => {
      tiles[i].textContent = cell.letter;
      tiles[i].removeAttribute('style');
      tiles[i].setAttribute('data-state', cell.state);
    });
  });
}

/**
 * Updates the current (active) row's tiles as the player types.
 */
export function updateCurrentRow(rowIndex, currentGuess) {
  const rows = document.querySelectorAll('.board-row');
  const tiles = rows[rowIndex].querySelectorAll('.tile');
  tiles.forEach((tile, i) => {
    const letter = currentGuess[i] || '';
    const prev = tile.textContent;
    tile.textContent = letter;
    if (letter) {
      tile.setAttribute('data-state', 'filled');
      if (letter !== prev) {
        tile.classList.remove('pop');
        // Force reflow to restart animation
        void tile.offsetWidth;
        tile.classList.add('pop');
        tile.addEventListener('animationend', () => tile.classList.remove('pop'), { once: true });
      }
    } else {
      tile.setAttribute('data-state', 'empty');
    }
  });
}

/**
 * Reveals a completed row with a staggered flip animation.
 * @param {Function} onComplete - Called after all tiles have finished animating.
 */
export function revealRow(rowIndex, evaluated, onComplete) {
  const rows = document.querySelectorAll('.board-row');
  const tiles = rows[rowIndex].querySelectorAll('.tile');
  const FLIP_HALF = 250;
  const STAGGER = 100;

  tiles.forEach((tile, i) => {
    const delay = i * STAGGER;
    setTimeout(() => {
      // Phase 1: rotate down (tile disappears edge-on)
      tile.style.transition = `transform ${FLIP_HALF}ms ease-in`;
      tile.style.transform = 'rotateX(-90deg)';

      // Phase 2: apply colour then rotate back up
      setTimeout(() => {
        tile.setAttribute('data-state', evaluated[i].state);
        tile.style.transition = `transform ${FLIP_HALF}ms ease-out`;
        tile.style.transform = 'rotateX(0deg)';
      }, FLIP_HALF);  // relative to when the outer setTimeout fired — not additive
    }, delay);
  });

  const totalDuration = (tiles.length - 1) * STAGGER + FLIP_HALF * 2;
  setTimeout(() => onComplete && onComplete(), totalDuration);
}

/**
 * Shakes the current row to signal an invalid guess.
 */
export function shakeRow(rowIndex) {
  const row = document.querySelectorAll('.board-row')[rowIndex];
  row.classList.add('shake');
  row.addEventListener('animationend', () => row.classList.remove('shake'), { once: true });
}

/**
 * Bounces each tile in the winning row.
 */
export function bounceRow(rowIndex) {
  const tiles = document.querySelectorAll('.board-row')[rowIndex].querySelectorAll('.tile');
  tiles.forEach((tile, i) => {
    setTimeout(() => {
      tile.classList.add('bounce');
      tile.addEventListener('animationend', () => tile.classList.remove('bounce'), { once: true });
    }, i * 100);
  });
}

// ─── Keyboard ────────────────────────────────────────────────────────────────

export function initKeyboard(onKey) {
  const keyboard = document.getElementById('keyboard');
  keyboard.innerHTML = '';
  KEYBOARD_ROWS.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'keyboard-row';
    row.forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'key';
      btn.textContent = key;
      btn.setAttribute('data-key', key);
      if (key === 'ENTER' || key === '\u232B') btn.classList.add('wide');
      btn.addEventListener('click', () => onKey(key));
      rowEl.appendChild(btn);
    });
    keyboard.appendChild(rowEl);
  });
}

/**
 * Applies letter states to the on-screen keyboard keys.
 * Expects letterStates to already reflect the best (highest priority) state.
 */
export function renderKeyboard(letterStates) {
  Object.entries(letterStates).forEach(([letter, state]) => {
    const key = document.querySelector(`.key[data-key="${letter}"]`);
    if (key) key.setAttribute('data-state', state);
  });
}

// ─── Toast ───────────────────────────────────────────────────────────────────

let _toastTimer;

export function showToast(message, duration = 1200) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  // Force reflow so transition plays even on rapid calls
  void toast.offsetWidth;
  toast.classList.add('show');

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 200);
  }, duration);
}

// ─── Win celebration ─────────────────────────────────────────────────────────

export function showWinCelebration() {
  const container = document.createElement('div');
  container.className = 'footprints-container';
  const icons = ['\uD83E\uDD95', '\uD83E\uDD96', '\uD83E\uDDB4', '\uD83D\uDC3E'];

  for (let i = 0; i < 10; i++) {
    const fp = document.createElement('span');
    fp.className = 'footprint';
    fp.textContent = icons[Math.floor(Math.random() * icons.length)];
    fp.style.setProperty('--delay', `${i * 180}ms`);
    fp.style.setProperty('--rot', `${Math.random() * 40 - 20}deg`);
    fp.style.left = `${Math.random() * 80 + 10}%`;
    fp.style.top = `${Math.random() * 75 + 10}%`;
    container.appendChild(fp);
  }

  document.body.appendChild(container);
  setTimeout(() => container.remove(), 4500);
}
