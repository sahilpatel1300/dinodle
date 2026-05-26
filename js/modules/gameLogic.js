export const MAX_GUESSES = 7;
export const WORD_LENGTH = 10;

/**
 * Evaluates a guess against the answer using standard Wordle logic:
 * 1. First pass locks in correct (green) positions and decrements counts.
 * 2. Second pass awards present (yellow) for remaining letters, up to their count.
 * @returns {Array<{letter: string, state: 'correct'|'present'|'absent'}>}
 */
export function evaluateGuess(guess, answer) {
  const g = guess.toUpperCase().split('');
  const a = answer.toUpperCase().split('');
  const result = g.map(letter => ({ letter, state: 'absent' }));

  const remaining = {};
  for (const ch of a) remaining[ch] = (remaining[ch] || 0) + 1;

  // Pass 1: greens
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (g[i] === a[i]) {
      result[i].state = 'correct';
      remaining[g[i]]--;
    }
  }

  // Pass 2: yellows
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i].state === 'correct') continue;
    const ch = g[i];
    if (remaining[ch] > 0) {
      result[i].state = 'present';
      remaining[ch]--;
    }
  }

  return result;
}

export function isWin(evaluated) {
  return evaluated.every(cell => cell.state === 'correct');
}

/**
 * Generates the clipboard share text in standard Wordle format.
 */
export function generateShareText(evaluatedRows, won, puzzleNumber, maxGuesses) {
  const guessCount = won ? evaluatedRows.length : 'X';
  const header = `Dirdle \uD83E\uDD95 #${puzzleNumber} ${guessCount}/${maxGuesses}`;

  const emojiMap = { correct: '\uD83D\uDFE9', present: '\uD83D\uDFE8', absent: '\u2B1B' };

  const rows = evaluatedRows
    .map(row => row.map(cell => emojiMap[cell.state]).join(''))
    .join('\n');

  return `${header}\n\n${rows}`;
}

/** Priority used to determine which letter state "wins" on the keyboard. */
export const STATE_PRIORITY = { correct: 3, present: 2, absent: 1 };
