import { state, setPhase, Phase } from "../state.js";
import { createRound, getCategoryLabel } from "../game-logic.js";
import { $ } from "../utils.js";

let titleEl, imposterEl, categoryEl, wordEl, hintLabelEl, hintEl, playAgainBtn, newSetupBtn;

export function init() {
  titleEl = $("#results-title");
  imposterEl = $("#results-imposter");
  categoryEl = $("#results-category");
  wordEl = $("#results-word");
  hintLabelEl = $("#results-hint-label");
  hintEl = $("#results-hint");
  playAgainBtn = $("#play-again");
  newSetupBtn = $("#new-setup");

  playAgainBtn.addEventListener("click", () => {
    state.round = createRound(state.playerNames, state.selectedCategories, state.difficulty, state.imposterCount);
    state.revealIndex = 0;
    setPhase(Phase.REVEAL);
  });

  newSetupBtn.addEventListener("click", () => {
    setPhase(Phase.SETUP);
  });
}

function formatNameList(names) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

export function onEnter() {
  const { round } = state;
  const imposterNames = round.imposterIndices.map((i) => state.playerNames[i]);

  if (imposterNames.length === 0) {
    titleEl.textContent = "There was no Imposter...";
    imposterEl.textContent = "Everyone knew the word!";
    hintLabelEl.hidden = true;
    hintEl.hidden = true;
  } else {
    titleEl.textContent = imposterNames.length === 1 ? "The Imposter was..." : "The Imposters were...";
    imposterEl.textContent = formatNameList(imposterNames);
    hintLabelEl.hidden = false;
    hintEl.hidden = false;
    hintLabelEl.textContent = imposterNames.length === 1 ? "Imposter's hint was:" : "Imposters' hints were:";
    hintEl.textContent =
      imposterNames.length === 1
        ? round.imposterHints[0]
        : imposterNames.map((name, i) => `${name}: ${round.imposterHints[i]}`).join("\n");
  }

  categoryEl.textContent = getCategoryLabel(round.category);
  wordEl.textContent = round.word;
}
