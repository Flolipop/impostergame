import { state, setPhase, Phase } from "../state.js";
import { getCategoryLabel } from "../game-logic.js";
import { $ } from "../utils.js";

let progressEl, passLabelEl, cardEl, roleEl, categoryEl, wordEl, hideBtn;
let revealed = false;

export function init() {
  progressEl = $("#reveal-progress");
  passLabelEl = $("#reveal-pass-label");
  cardEl = $("#reveal-card");
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
  cardEl.classList.remove("is-revealed");
  hideBtn.hidden = true;
  updateLabels();
}

function updateLabels() {
  const seat = state.revealIndex + 1;
  const name = state.playerNames[state.revealIndex];
  progressEl.textContent = `${seat} of ${state.playerNames.length}`;
  passLabelEl.textContent = `Pass the phone to ${name}`;
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
  cardEl.classList.add("is-revealed");
  hideBtn.hidden = false;
}

function advanceToNextPlayer() {
  revealed = false;
  cardEl.classList.remove("is-revealed");
  hideBtn.hidden = true;

  if (state.revealIndex + 1 >= state.playerNames.length) {
    setPhase(Phase.DISCUSS);
    return;
  }

  state.revealIndex += 1;
  updateLabels();
}
