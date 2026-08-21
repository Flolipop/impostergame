export const Phase = Object.freeze({
  SETUP: "setup",
  REVEAL: "reveal",
  DISCUSS: "discuss",
  RESULTS: "results",
});

export const state = {
  phase: Phase.SETUP,
  playerNames: [],
  selectedCategories: ["anime", "movies", "videoGames", "general"],
  difficulty: "medium",
  round: null,
  revealIndex: 0,
};

const listeners = {};

export function onEnterPhase(phase, handler) {
  listeners[phase] = handler;
}

export function setPhase(next) {
  state.phase = next;
  document.body.dataset.activePhase = next;
  listeners[next]?.();
}
