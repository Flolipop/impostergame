import { Phase, setPhase } from "../state.js";
import { getAllCategoryIds, getCategoryLabel } from "../game-logic.js";
import { getWords, addWord, updateWord, deleteWord, resetCategory } from "../wordbank.js";
import { $, $all } from "../utils.js";

let selectedCategory = "anime";
let editingIndex = null;

let backBtn, resetBtn, tabsEl, wordInput, hintEasyInput, hintMediumInput, hintHardInput, errorEl, addBtn, listEl;

export function init() {
  backBtn = $("#editor-back");
  resetBtn = $("#editor-reset");
  tabsEl = $("#editor-category-tabs");
  wordInput = $("#editor-word-input");
  hintEasyInput = $("#editor-hint-easy");
  hintMediumInput = $("#editor-hint-medium");
  hintHardInput = $("#editor-hint-hard");
  errorEl = $("#editor-error");
  addBtn = $("#editor-add-word");
  listEl = $("#editor-word-list");

  selectedCategory = getAllCategoryIds()[0] ?? "anime";

  backBtn.addEventListener("click", () => setPhase(Phase.SETUP));

  resetBtn.addEventListener("click", () => {
    resetCategory(selectedCategory);
    editingIndex = null;
    hideError();
    render();
  });

  $all(".chip", tabsEl).forEach((chip) => {
    chip.addEventListener("click", () => {
      selectedCategory = chip.dataset.category;
      editingIndex = null;
      hideError();
      render();
    });
  });

  addBtn.addEventListener("click", handleAddWord);

  render();
}

export function onEnter() {
  editingIndex = null;
  hideError();
  render();
}

function isSingleWord(value) {
  const trimmed = value.trim();
  return trimmed.length > 0 && !/\s/.test(trimmed);
}

function handleAddWord() {
  const word = wordInput.value.trim();
  const easy = hintEasyInput.value.trim();
  const medium = hintMediumInput.value.trim();
  const hard = hintHardInput.value.trim();

  if (!word) {
    showError("Enter a word.");
    return;
  }
  if (!isSingleWord(easy) || !isSingleWord(medium) || !isSingleWord(hard)) {
    showError("Enter all three hints — one word each, no spaces.");
    return;
  }

  addWord(selectedCategory, { word, hints: { easy, medium, hard } });
  wordInput.value = "";
  hintEasyInput.value = "";
  hintMediumInput.value = "";
  hintHardInput.value = "";
  hideError();
  render();
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function hideError() {
  errorEl.hidden = true;
}

function render() {
  $all(".chip", tabsEl).forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.category === selectedCategory);
  });

  listEl.innerHTML = "";
  const words = getWords(selectedCategory);

  if (words.length === 0) {
    const empty = document.createElement("li");
    empty.className = "player-list-empty";
    empty.textContent = "No words in this category yet.";
    listEl.appendChild(empty);
    return;
  }

  words.forEach((entry, index) => {
    const li = document.createElement("li");
    li.className = "editor-word-row";
    li.appendChild(index === editingIndex ? buildEditForm(entry, index) : buildDisplayRow(entry, index));
    listEl.appendChild(li);
  });
}

function buildDisplayRow(entry, index) {
  const wrap = document.createElement("div");
  wrap.className = "editor-word-row-display";

  const info = document.createElement("div");
  info.className = "editor-word-info";

  const title = document.createElement("span");
  title.className = "editor-word-title";
  title.textContent = entry.word;

  const hints = document.createElement("span");
  hints.className = "editor-word-hints";
  hints.textContent = `${entry.hints.easy} · ${entry.hints.medium} · ${entry.hints.hard}`;

  info.append(title, hints);

  const actions = document.createElement("div");
  actions.className = "editor-word-actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "editor-action-btn";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => {
    editingIndex = index;
    hideError();
    render();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "editor-action-btn editor-action-danger";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => {
    deleteWord(selectedCategory, index);
    if (editingIndex === index) editingIndex = null;
    render();
  });

  actions.append(editBtn, deleteBtn);
  wrap.append(info, actions);
  return wrap;
}

function buildEditForm(entry, index) {
  const form = document.createElement("div");
  form.className = "editor-word-row-edit";

  const wordField = makeField(entry.word, "Word", 40);
  const easyField = makeField(entry.hints.easy, "Easy hint", 20);
  const mediumField = makeField(entry.hints.medium, "Medium hint", 20);
  const hardField = makeField(entry.hints.hard, "Hard hint", 20);

  const rowError = document.createElement("p");
  rowError.className = "error-text editor-row-error";
  rowError.hidden = true;

  const actions = document.createElement("div");
  actions.className = "editor-word-actions";

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "btn btn-primary editor-form-btn";
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", () => {
    const word = wordField.value.trim();
    const easy = easyField.value.trim();
    const medium = mediumField.value.trim();
    const hard = hardField.value.trim();

    if (!word || !isSingleWord(easy) || !isSingleWord(medium) || !isSingleWord(hard)) {
      rowError.textContent = "Word required; hints must be one word each.";
      rowError.hidden = false;
      return;
    }

    updateWord(selectedCategory, index, { word, hints: { easy, medium, hard } });
    editingIndex = null;
    render();
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "btn btn-secondary editor-form-btn";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => {
    editingIndex = null;
    render();
  });

  actions.append(saveBtn, cancelBtn);
  form.append(wordField, easyField, mediumField, hardField, rowError, actions);
  return form;
}

function makeField(value, placeholder, maxLength) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "name-input editor-word-field";
  input.value = value;
  input.placeholder = placeholder;
  input.maxLength = maxLength;
  input.autocomplete = "off";
  return input;
}
