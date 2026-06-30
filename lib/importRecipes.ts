import { parseIngredientLines } from "@/lib/ingredients";
import type { Recipe } from "@/lib/types";

function createRecipeId() {
  return crypto.randomUUID();
}

function parseTagsLine(line: string): string[] {
  return line
    .replace(/^tags\s*:/i, "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

export function importRecipesFromText(text: string): Recipe[] {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim());

  const recipes: Recipe[] = [];

  let currentName = "";
  let currentTags: string[] = [];
  let currentIngredientLines: string[] = [];

  function saveCurrentRecipe() {
    if (!currentName.trim()) return;

    const rawIngredients = currentIngredientLines.join("\n").trim();

    if (!rawIngredients) return;

    recipes.push({
      id: createRecipeId(),
      name: currentName.trim(),
      rawIngredients,
      ingredients: parseIngredientLines(rawIngredients),
      tags: currentTags,
    });
  }

  for (const line of lines) {
    if (!line) {
      continue;
    }

    if (line.startsWith("#")) {
      saveCurrentRecipe();

      currentName = line.replace(/^#+/, "").trim();
      currentTags = [];
      currentIngredientLines = [];
      continue;
    }

    if (/^tags\s*:/i.test(line)) {
      currentTags = parseTagsLine(line);
      continue;
    }

    currentIngredientLines.push(line);
  }

  saveCurrentRecipe();

  return recipes;
}
