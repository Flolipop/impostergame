import { Phase, setPhase } from "../state.js";
import { getAllCategoryIds, getCategoryLabel } from "../game-logic.js";
import { getWords, addWord, updateWord, deleteWord, resetCategory, exportWordBank, importWordBank } from "../wordbank.js";
import { $, $all } from "../utils.js";

let selectedCategory = "anime";
let editingIndex = null;
let searchQuery = "";

let backBtn,
  resetBtn,
  tabsEl,
  wordInput,
  hintEasyInput,
  hintMediumInput,
  hintHardInput,
  errorEl,
  addBtn,
  listEl,
  searchInput,
  exportBtn,
  importBtn,
  importInput,
  ioMessageEl;

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
  searchInput = $("#editor-search");
  exportBtn = $("#editor-export");
  importBtn = $("#editor-import");
  importInput = $("#editor-import-input");
  ioMessageEl = $("#editor-io-message");

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

  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    render();
  });

  exportBtn.addEventListener("click", handleExport);
  importBtn.addEventListener("click", () => importInput.click());
  importInput.addEventListener("change", handleImport);

  render();
}

export function onEnter() {
  editingIndex = null;
  hideError();
  hideIoMessage();
  render();
}

function handleExport() {
  const data = exportWordBank();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "imposter-word-lists.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showIoMessage("Word lists exported.");
}

function handleImport() {
  const file = importInput.files?.[0];
  importInput.value = "";
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const { added, skipped } = importWordBank(data);
      showIoMessage(
        added === 0
          ? "No new words found — everything in that file is already here."
          : `Imported ${added} word${added === 1 ? "" : "s"}${skipped > 0 ? ` (${skipped} skipped as duplicates or invalid)` : ""}.`
      );
      render();
    } catch (err) {
      showIoMessage(err instanceof Error ? err.message : "Couldn't import that file.", true);
    }
  };
  reader.onerror = () => showIoMessage("Couldn't read that file.", true);
  reader.readAsText(file);
}

function showIoMessage(message, isError = false) {
  ioMessageEl.textContent = message;
  ioMessageEl.classList.toggle("editor-io-message-error", isError);
  ioMessageEl.hidden = false;
}

function hideIoMessage() {
  ioMessageEl.hidden = true;
}

function isSingleWord(value) {
  return value.length > 0 && !/\s/.test(value);
}

// Parses a comma-separated field into a hint pool: trims each part, drops
// empties, and requires every remaining part to be a single word.
function parseHintPool(value) {
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (parts.length === 0 || !parts.every(isSingleWord)) return null;
  return parts;
}

function handleAddWord() {
  const word = wordInput.value.trim();
  const easy = parseHintPool(hintEasyInput.value);
  const medium = parseHintPool(hintMediumInput.value);
  const hard = parseHintPool(hintHardInput.value);

  if (!word) {
    showError("Enter a word.");
    return;
  }
  if (!easy || !medium || !hard) {
    showError("Enter at least one hint per tier, comma-separated — each hint must be a single word, no spaces.");
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
  const allWords = getWords(selectedCategory);
  const query = searchQuery.trim().toLowerCase();
  const entries = query
    ? allWords
        .map((entry, index) => ({ entry, index }))
        .filter(
          ({ entry }) =>
            entry.word.toLowerCase().includes(query) ||
            entry.hints.easy.some((hint) => hint.toLowerCase().includes(query)) ||
            entry.hints.medium.some((hint) => hint.toLowerCase().includes(query)) ||
            entry.hints.hard.some((hint) => hint.toLowerCase().includes(query))
        )
    : allWords.map((entry, index) => ({ entry, index }));

  if (entries.length === 0) {
    const empty = document.createElement("li");
    empty.className = "player-list-empty";
    empty.textContent = allWords.length === 0 ? "No words in this category yet." : "No words match your search.";
    listEl.appendChild(empty);
    return;
  }

  entries.forEach(({ entry, index }) => {
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
  hints.textContent = `${entry.hints.easy.join(", ")} · ${entry.hints.medium.join(", ")} · ${entry.hints.hard.join(", ")}`;

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
  const easyField = makeField(entry.hints.easy.join(", "), "Easy hints, comma-separated", 120);
  const mediumField = makeField(entry.hints.medium.join(", "), "Medium hints, comma-separated", 120);
  const hardField = makeField(entry.hints.hard.join(", "), "Hard hints, comma-separated", 120);

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
    const easy = parseHintPool(easyField.value);
    const medium = parseHintPool(mediumField.value);
    const hard = parseHintPool(hardField.value);

    if (!word || !easy || !medium || !hard) {
      rowError.textContent = "Word required; each hint tier needs at least one single-word hint, comma-separated.";
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
