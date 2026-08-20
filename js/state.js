export const Phase = Object.freeze({
  SETUP: "setup",
  REVEAL: "reveal",
  RESULTS: "results",
});

export const state = {
  phase: Phase.SETUP,
  playerCount: 5,
  selectedCategories: ["anime", "movies", "videoGames", "general"],
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
