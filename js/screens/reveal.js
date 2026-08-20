import { state, setPhase, Phase } from "../state.js";
import { getCategoryLabel } from "../game-logic.js";
import { $ } from "../utils.js";

let progressEl, passLabelEl, cardEl, cardBackEl, roleEl, categoryEl, wordEl, hideBtn;
let revealed = false;

export function init() {
  progressEl = $("#reveal-progress");
  passLabelEl = $("#reveal-pass-label");
  cardEl = $("#reveal-card");
  cardBackEl = $("#reveal-card-back");
  roleEl = $("#reveal-role");
  categoryEl = $("#reveal-category");
  wordEl = $("#reveal-word");
  hideBtn = $("#reveal-hide");

  cardEl.addEventListener("click", () => {
    if (revealed) return;
    revealCurrentPlayer();
  });

  hideBtn.addEventListener("click", advanceToNextPlayer);
}

export function onEnter() {
  revealed = false;
  cardBackEl.hidden = true;
  hideBtn.hidden = true;
  updateLabels();
}

function updateLabels() {
  const seat = state.revealIndex + 1;
  progressEl.textContent = `Player ${seat} of ${state.playerCount}`;
  passLabelEl.textContent = `Pass the phone to Player ${seat}`;
}

function revealCurrentPlayer() {
  const { round, revealIndex } = state;
  const isImposter = revealIndex === round.imposterIndex;

  if (isImposter) {
    roleEl.textContent = "You are the Imposter!";
    categoryEl.textContent = getCategoryLabel(round.category);
    wordEl.textContent = `Hint: ${round.hint}`;
  } else {
    roleEl.textContent = "The secret word is:";
    categoryEl.textContent = getCategoryLabel(round.category);
    wordEl.textContent = round.word;
  }

  revealed = true;
  cardBackEl.hidden = false;
  hideBtn.hidden = false;
}

function advanceToNextPlayer() {
  revealed = false;
  cardBackEl.hidden = true;
  hideBtn.hidden = true;

  if (state.revealIndex + 1 >= state.playerCount) {
    setPhase(Phase.TIMER);
    return;
  }

  state.revealIndex += 1;
  updateLabels();
}
