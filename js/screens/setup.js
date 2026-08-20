import { state, setPhase, Phase } from "../state.js";
import { createRound, getAllCategoryIds, getCategoryLabel } from "../game-logic.js";
import { $, $all } from "../utils.js";

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

let playerCountEl, categoryListEl, errorEl, startBtn;

export function init() {
  playerCountEl = $("#player-count");
  categoryListEl = $("#category-list");
  errorEl = $("#setup-error");
  startBtn = $("#start-game");

  $("#player-decrement").addEventListener("click", () => changePlayerCount(-1));
  $("#player-increment").addEventListener("click", () => changePlayerCount(1));

  renderCategoryList();

  startBtn.addEventListener("click", startGame);

  render();
}

export function onEnter() {
  render();
}

function renderCategoryList() {
  categoryListEl.innerHTML = "";
  getAllCategoryIds().forEach((id) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category-toggle";
    btn.dataset.category = id;
    btn.textContent = getCategoryLabel(id);
    btn.addEventListener("click", () => toggleCategory(id, btn));
    categoryListEl.appendChild(btn);
  });
}

function toggleCategory(id, btn) {
  const idx = state.selectedCategories.indexOf(id);
  if (idx >= 0) {
    state.selectedCategories.splice(idx, 1);
  } else {
    state.selectedCategories.push(id);
  }
  render();
}

function changePlayerCount(delta) {
  const next = state.playerCount + delta;
  if (next < MIN_PLAYERS || next > MAX_PLAYERS) return;
  state.playerCount = next;
  render();
}

function startGame() {
  if (state.selectedCategories.length === 0) {
    showError("Pick at least one category.");
    return;
  }
  hideError();
  state.round = createRound(state.playerCount, state.selectedCategories);
  state.revealIndex = 0;
  setPhase(Phase.REVEAL);
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function hideError() {
  errorEl.hidden = true;
}

function render() {
  playerCountEl.textContent = String(state.playerCount);
  $all(".category-toggle", categoryListEl).forEach((btn) => {
    btn.classList.toggle("active", state.selectedCategories.includes(btn.dataset.category));
  });
}
