import { CATEGORIES } from "../data/categories.js";
import { randomInt, shuffle } from "./utils.js";

export function getAllCategoryIds() {
  return Object.keys(CATEGORIES);
}

export function getCategoryLabel(id) {
  return CATEGORIES[id]?.label ?? id;
}

// Builds a fresh round: picks a random word from a random selected category,
// a random imposter, and a random player to start the discussion. difficulty
// picks which hint tier ("easy" | "medium" | "hard") the imposter sees.
export function createRound(playerNames, selectedCategoryIds, difficulty = "medium") {
  const pool = selectedCategoryIds.flatMap((id) => {
    const category = CATEGORIES[id];
    if (!category) return [];
    return category.words.map((entry) => ({ ...entry, category: id }));
  });

  if (pool.length === 0) {
    throw new Error("No categories selected");
  }

  const shuffled = shuffle(pool);
  const pick = shuffled[randomInt(shuffled.length)];
  const imposterIndex = randomInt(playerNames.length);
  const starterIndex = randomInt(playerNames.length);

  return {
    category: pick.category,
    word: pick.word,
    hint: pick.hints[difficulty] ?? pick.hints.medium,
    imposterIndex,
    starterIndex,
  };
}
