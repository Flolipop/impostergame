import { state, setPhase, Phase } from "../state.js";
import { createRound, getAllCategoryIds, getCategoryLabel } from "../game-logic.js";
import { loadSetup, saveSetup } from "../storage.js";
import { $, $all } from "../utils.js";

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

let nameInputEl, addBtn, clearAllBtn, playerListEl, playerCountLabelEl, categoryListEl, difficultyListEl, errorEl, startBtn, editorBtn;

export function init() {
  const saved = loadSetup();
  if (saved) {
    state.playerNames = saved.playerNames;
    state.selectedCategories = saved.selectedCategories;
    state.difficulty = saved.difficulty;
  }

  nameInputEl = $("#player-name-input");
  addBtn = $("#player-add");
  clearAllBtn = $("#clear-all-names");
  playerListEl = $("#player-list");
  playerCountLabelEl = $("#player-count-label");
  categoryListEl = $("#category-list");
  difficultyListEl = $("#difficulty-choices");
  errorEl = $("#setup-error");
  startBtn = $("#start-game");
  editorBtn = $("#open-editor");

  addBtn.addEventListener("click", addNameFromInput);
  nameInputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addNameFromInput();
    }
  });

  clearAllBtn.addEventListener("click", clearAllNames);

  renderCategoryList();

  $all(".chip", difficultyListEl).forEach((chip) => {
    chip.addEventListener("click", () => {
      state.difficulty = chip.dataset.difficulty;
      persist();
      render();
    });
  });

  startBtn.addEventListener("click", startGame);
  editorBtn.addEventListener("click", () => setPhase(Phase.EDITOR));

  render();
}

export function onEnter() {
  render();
}

function persist() {
  saveSetup({
    playerNames: state.playerNames,
    selectedCategories: state.selectedCategories,
    difficulty: state.difficulty,
  });
}

function addNameFromInput() {
  const name = nameInputEl.value.trim();
  if (!name) return;

  if (state.playerNames.length >= MAX_PLAYERS) {
    showError(`You can only have up to ${MAX_PLAYERS} players.`);
    return;
  }

  hideError();
  state.playerNames.push(name);
  nameInputEl.value = "";
  persist();
  render();
  nameInputEl.focus();
}

function removePlayerName(index) {
  state.playerNames.splice(index, 1);
  persist();
  render();
}

function clearAllNames() {
  if (state.playerNames.length === 0) return;
  state.playerNames = [];
  persist();
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
    btn.addEventListener("click", () => toggleCategory(id));
    categoryListEl.appendChild(btn);
  });
}

function toggleCategory(id) {
  const idx = state.selectedCategories.indexOf(id);
  if (idx >= 0) {
    state.selectedCategories.splice(idx, 1);
  } else {
    state.selectedCategories.push(id);
  }
  persist();
  render();
}

function startGame() {
  if (state.playerNames.length < MIN_PLAYERS) {
    showError(`Add at least ${MIN_PLAYERS} players.`);
    return;
  }
  if (state.selectedCategories.length === 0) {
    showError("Pick at least one category.");
    return;
  }
  hideError();
  state.round = createRound(state.playerNames, state.selectedCategories, state.difficulty);
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

function renderPlayerList() {
  playerListEl.innerHTML = "";

  if (state.playerNames.length === 0) {
    const empty = document.createElement("li");
    empty.className = "player-list-empty";
    empty.textContent = "No players yet — add at least 3.";
    playerListEl.appendChild(empty);
    return;
  }

  state.playerNames.forEach((name, index) => {
    const row = document.createElement("li");
    row.className = "player-row";

    const nameEl = document.createElement("span");
    nameEl.className = "player-row-name";
    nameEl.textContent = name;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "player-row-remove";
    removeBtn.textContent = "×";
    removeBtn.setAttribute("aria-label", `Remove ${name}`);
    removeBtn.addEventListener("click", () => removePlayerName(index));

    row.appendChild(nameEl);
    row.appendChild(removeBtn);
    playerListEl.appendChild(row);
  });
}

function render() {
  renderPlayerList();
  playerCountLabelEl.textContent = `(${state.playerNames.length}/${MAX_PLAYERS})`;
  addBtn.disabled = state.playerNames.length >= MAX_PLAYERS;
  clearAllBtn.disabled = state.playerNames.length === 0;

  $all(".category-toggle", categoryListEl).forEach((btn) => {
    btn.classList.toggle("active", state.selectedCategories.includes(btn.dataset.category));
  });

  $all(".chip", difficultyListEl).forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.difficulty === state.difficulty);
  });
}
