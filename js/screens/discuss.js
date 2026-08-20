import { state, setPhase, Phase } from "../state.js";
import { $ } from "../utils.js";

let starterEl, revealBtn;

export function init() {
  starterEl = $("#discuss-starter");
  revealBtn = $("#discuss-reveal");

  revealBtn.addEventListener("click", () => setPhase(Phase.RESULTS));
}

export function onEnter() {
  const name = state.playerNames[state.round.starterIndex];
  starterEl.textContent = `${name} starts the discussion!`;
}
