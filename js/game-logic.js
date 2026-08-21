import { getCategories, getAllCategoryIds as getWordbankCategoryIds, getCategoryLabel as getWordbankCategoryLabel } from "./wordbank.js";
import { randomInt, shuffle } from "./utils.js";

export function getAllCategoryIds() {
  return getWordbankCategoryIds();
}

export function getCategoryLabel(id) {
  return getWordbankCategoryLabel(id);
}

// Builds a fresh round: picks a random word from a random selected category,
// a random imposter, and a random player to start the discussion. difficulty
// picks which hint tier ("easy" | "medium" | "hard") the imposter sees.
export function createRound(playerNames, selectedCategoryIds, difficulty = "medium") {
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
