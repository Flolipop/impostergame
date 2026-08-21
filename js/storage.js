const KEY = "imposter:setup:v1";

export function loadSetup() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;

    return {
      playerNames: Array.isArray(data.playerNames)
        ? data.playerNames.filter((n) => typeof n === "string")
        : [],
      selectedCategories: Array.isArray(data.selectedCategories)
        ? data.selectedCategories.filter((c) => typeof c === "string")
        : [],
      difficulty: typeof data.difficulty === "string" ? data.difficulty : "medium",
    };
  } catch {
    return null;
  }
}

export function saveSetup({ playerNames, selectedCategories, difficulty }) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ playerNames, selectedCategories, difficulty }));
  } catch {
    // localStorage unavailable (private mode, disabled, quota) — ignore.
  }
}
