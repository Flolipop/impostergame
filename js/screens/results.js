import { state, setPhase, Phase } from "../state.js";
import { createRound, getCategoryLabel } from "../game-logic.js";
import { $ } from "../utils.js";

let imposterEl, categoryEl, wordEl, hintEl, playAgainBtn, newSetupBtn;

export function init() {
  imposterEl = $("#results-imposter");
  categoryEl = $("#results-category");
  wordEl = $("#results-word");
  hintEl = $("#results-hint");
  playAgainBtn = $("#play-again");
  newSetupBtn = $("#new-setup");

  playAgainBtn.addEventListener("click", () => {
    state.round = createRound(state.playerNames, state.selectedCategories, state.difficulty);
    state.revealIndex = 0;
    setPhase(Phase.REVEAL);
  });

  newSetupBtn.addEventListener("click", () => {
    setPhase(Phase.SETUP);
  });
}

export function onEnter() {
  const { round } = state;
  imposterEl.textContent = state.playerNames[round.imposterIndex];
  categoryEl.textContent = getCategoryLabel(round.category);
  wordEl.textContent = round.word;
  hintEl.textContent = round.hint;
}
