import { getCategories, getAllCategoryIds as getWordbankCategoryIds, getCategoryLabel as getWordbankCategoryLabel } from "./wordbank.js";
import { randomInt, shuffle } from "./utils.js";

export function getAllCategoryIds() {
  return getWordbankCategoryIds();
}

export function getCategoryLabel(id) {
  return getWordbankCategoryLabel(id);
}

// Builds a fresh round: picks a random word from a random selected category,
// `imposterCount` random imposters (0 = no imposter, up to every player) each
// with their own hint, and a random player to start the discussion.
// difficulty picks which hint tier ("easy" | "medium" | "hard") imposters see.
export function createRound(playerNames, selectedCategoryIds, difficulty = "medium", imposterCount = 1) {
  const categories = getCategories();
  const pool = selectedCategoryIds.flatMap((id) => {
    const category = categories[id];
    if (!category) return [];
    return category.words.map((entry) => ({ ...entry, category: id }));
  });

  if (pool.length === 0) {
    throw new Error("No categories selected");
  }

  const shuffled = shuffle(pool);
  const pick = shuffled[randomInt(shuffled.length)];
  const clampedImposterCount = Math.max(0, Math.min(imposterCount, playerNames.length));
  const imposterIndices = shuffle(playerNames.map((_, i) => i)).slice(0, clampedImposterCount);
  const starterIndex = randomInt(playerNames.length);
  const hintPool = pick.hints[difficulty] ?? pick.hints.medium;
  const shuffledHints = shuffle(hintPool);
  // Cycle through the shuffled pool so imposters get distinct hints where
  // possible, wrapping around if there are more imposters than pool hints.
  const imposterHints = imposterIndices.map((_, i) => shuffledHints[i % shuffledHints.length]);

  return {
    category: pick.category,
    word: pick.word,
    imposterIndices,
    imposterHints,
    starterIndex,
  };
}
