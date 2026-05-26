const NA = 'Womp womp, not available';

// ─── Dino Dossier ─────────────────────────────────────────────────────────────

/**
 * Builds and displays the post-game Dino Dossier modal.
 * @param {object}  dino        - The full dinosaur object from DINOSAUR_LIST.
 * @param {boolean} won         - Whether the player solved the puzzle.
 * @param {string}  shareText   - Pre-built share clipboard text.
 */
export function showDinoModal(dino, won, shareText) {
  const body = document.getElementById('dossier-body');

  const resultLabel = won
    ? '<span class="result-win">You got it! \uD83E\uDD95</span>'
    : '<span class="result-loss">Better luck tomorrow!</span>';

  const ageRange =
    dino.max_ma != null && dino.min_ma != null
      ? `${dino.min_ma}\u2013${dino.max_ma} Mya`
      : null;

  const lengthDisplay = dino.length_m != null ? `${dino.length_m} m` : null;

  body.innerHTML = `
    <div class="dossier-result">
      <div class="dossier-result-label">${resultLabel}</div>
      <div class="dossier-dino-name">${dino.name.toUpperCase()}</div>
      <span class="dossier-sublabel">FOSSIL DOSSIER</span>
    </div>

    <div class="dossier-grid">
      ${field('Diet', dino.diet)}
      ${field('Type', dino.type)}
      ${field('Length', dino.length_m, lengthDisplay)}
      ${fieldRaw('Age', ageRange)}
      ${field('Region', dino.region)}
      ${field('Class', dino.class)}
      ${field('Family', dino.family)}
    </div>

    <div class="dossier-countdown">
      <div class="dossier-countdown-label">Next Dirdle in</div>
      <div class="dossier-countdown-timer" id="countdown-timer">--:--:--</div>
    </div>

    <div class="dossier-actions">
      <button class="btn-share" id="btn-share-dossier">Share Results</button>
    </div>
  `;

  document.getElementById('btn-share-dossier').addEventListener('click', () => {
    copyToClipboard(shareText, document.getElementById('btn-share-dossier'));
  });

  startCountdown();
  document.getElementById('modal-dossier').classList.remove('hidden');
}

/**
 * Field where rawValue is the null-check sentinel and displayValue
 * is the formatted string shown (defaults to String(rawValue)).
 */
function field(label, rawValue, displayValue = null) {
  const isNA = rawValue == null;
  const shown = isNA ? NA : (displayValue != null ? displayValue : String(rawValue));
  return `
    <div class="dossier-field">
      <span class="dossier-field-label">${label}</span>
      <span class="dossier-field-value${isNA ? ' na' : ''}">${shown}</span>
    </div>`;
}

/** Field where the display string itself is the null check (e.g. pre-formatted age range). */
function fieldRaw(label, displayValue) {
  const isNA = displayValue == null;
  const shown = isNA ? NA : displayValue;
  return `
    <div class="dossier-field">
      <span class="dossier-field-label">${label}</span>
      <span class="dossier-field-value${isNA ? ' na' : ''}">${shown}</span>
    </div>`;
}

function startCountdown() {
  function tick() {
    const el = document.getElementById('countdown-timer');
    if (!el) return;

    const estNow = Date.now() - 5 * 3600000;
    const todayMidnightEST = Math.floor(estNow / 86400000) * 86400000;
    const nextMidnightEST = todayMidnightEST + 86400000;
    const ms = nextMidnightEST - estNow;

    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    el.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  tick();
  const id = setInterval(() => {
    if (!document.getElementById('countdown-timer')) {
      clearInterval(id);
      return;
    }
    tick();
  }, 1000);
}

function pad(n) {
  return String(n).padStart(2, '0');
}

// ─── Clipboard ───────────────────────────────────────────────────────────────

/**
 * Copies text to the clipboard and optionally toggles a button label.
 * @param {string}          text - Text to copy.
 * @param {HTMLElement|null} btn  - Button whose label flips to "Copied!" briefly.
 */
export function copyToClipboard(text, btn = null) {
  const onSuccess = () => {
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = original; }, 2000);
    }
  };

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopy(text, onSuccess));
  } else {
    fallbackCopy(text, onSuccess);
  }
}

function fallbackCopy(text, onSuccess) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    onSuccess();
  } catch {
    // Silently fail — clipboard unavailable.
  }
  document.body.removeChild(ta);
}
