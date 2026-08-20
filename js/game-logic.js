import { CATEGORIES } from "../data/categories.js";
import { randomInt, shuffle } from "./utils.js";

export function getAllCategoryIds() {
  return Object.keys(CATEGORIES);
}

export function getCategoryLabel(id) {
  return CATEGORIES[id]?.label ?? id;
}

// Builds a fresh round: picks a random word from a random selected category
// and a random imposter seat among playerCount players.
export function createRound(playerCount, selectedCategoryIds) {
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
  const imposterIndex = randomInt(playerCount);

  return {
    category: pick.category,
    word: pick.word,
    hint: pick.hint,
    imposterIndex,
    playerCount,
  };
}
