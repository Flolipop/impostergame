// The live word bank the game actually plays from. Starts as a copy of the
// built-in data/categories.js, then can be edited in-app (see screens/editor.js)
// and persisted to localStorage. data/categories.js itself is never modified —
// it's kept as the "factory defaults" a category can be reset back to.

import { CATEGORIES as DEFAULT_CATEGORIES } from "../data/categories.js";

const KEY = "imposter:wordbank:v1";

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isValidWordEntry(entry) {
  return (
    entry &&
    typeof entry.word === "string" &&
    entry.word.trim().length > 0 &&
    entry.hints &&
    typeof entry.hints.easy === "string" &&
    typeof entry.hints.medium === "string" &&
    typeof entry.hints.hard === "string" &&
    entry.hints.easy.trim().length > 0 &&
    entry.hints.medium.trim().length > 0 &&
    entry.hints.hard.trim().length > 0
  );
}

function loadRaw() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return typeof data === "object" && data !== null ? data : null;
  } catch {
    return null;
  }
}

function sanitize(loaded) {
  const result = {};
  for (const id of Object.keys(DEFAULT_CATEGORIES)) {
    const source = Array.isArray(loaded?.[id]?.words) ? loaded[id].words : null;
    result[id] = {
      label: DEFAULT_CATEGORIES[id].label,
      words: source ? source.filter(isValidWordEntry) : deepClone(DEFAULT_CATEGORIES[id].words),
    };
  }
  return result;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(categories));
  } catch {
    // localStorage unavailable — edits still work for this session, just won't persist.
  }
}

let categories = sanitize(loadRaw());

export function getCategories() {
  return categories;
}

export function getAllCategoryIds() {
  return Object.keys(categories);
}

export function getCategoryLabel(id) {
  return categories[id]?.label ?? id;
}

export function getWords(categoryId) {
  return categories[categoryId]?.words ?? [];
}

export function addWord(categoryId, entry) {
  categories[categoryId].words.push(entry);
  persist();
}

export function updateWord(categoryId, index, entry) {
  categories[categoryId].words[index] = entry;
  persist();
}

export function deleteWord(categoryId, index) {
  categories[categoryId].words.splice(index, 1);
  persist();
}

export function resetCategory(categoryId) {
  categories[categoryId] = {
    label: DEFAULT_CATEGORIES[categoryId].label,
    words: deepClone(DEFAULT_CATEGORIES[categoryId].words),
  };
  persist();
}

export function exportWordBank() {
  return { version: 1, categories: deepClone(categories) };
}

// Merges words from a previously exported word bank into the live one.
// Only known category ids are touched; words already present in a category
// (same word, case-insensitive) are skipped rather than duplicated.
export function importWordBank(data) {
  if (typeof data !== "object" || data === null || typeof data.categories !== "object" || data.categories === null) {
    throw new Error("That file isn't a word list export.");
  }

  let added = 0;
  let skipped = 0;

  for (const id of Object.keys(categories)) {
    const incoming = data.categories[id]?.words;
    if (!Array.isArray(incoming)) continue;

    const existingWords = new Set(categories[id].words.map((entry) => entry.word.toLowerCase()));

    for (const entry of incoming) {
      if (!isValidWordEntry(entry)) {
        skipped++;
        continue;
      }
      const key = entry.word.toLowerCase();
      if (existingWords.has(key)) {
        skipped++;
        continue;
      }
      existingWords.add(key);
      categories[id].words.push({
        word: entry.word.trim(),
        hints: { easy: entry.hints.easy.trim(), medium: entry.hints.medium.trim(), hard: entry.hints.hard.trim() },
      });
      added++;
    }
  }

  if (added > 0) persist();
  return { added, skipped };
}
