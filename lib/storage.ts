import type { ParsedIngredient } from "@/lib/ingredients";
import type { Recipe } from "@/lib/types";

const RECIPES_STORAGE_KEY = "meal-shuffle-recipes";
const SELECTED_RECIPES_STORAGE_KEY = "meal-shuffle-selected-recipes";
const CHECKED_ITEMS_STORAGE_KEY = "meal-shuffle-checked-items";
const MANUAL_ITEMS_STORAGE_KEY = "meal-shuffle-manual-items";

function safeReadFromStorage<T>(key: string, fallbackValue: T): T {
  try {
    const storedValue = window.localStorage.getItem(key);

    if (!storedValue) {
      return fallbackValue;
    }

    return JSON.parse(storedValue) as T;
  } catch {
    window.localStorage.removeItem(key);
    return fallbackValue;
  }
}

function safeWriteToStorage<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeRecipes(recipes: Recipe[]): Recipe[] {
  return recipes.map((recipe) => ({
    ...recipe,
    tags: recipe.tags ?? [],
  }));
}

export function loadRecipesFromStorage(): Recipe[] {
  return normalizeRecipes(
    safeReadFromStorage<Recipe[]>(RECIPES_STORAGE_KEY, []),
  );
}

export function saveRecipesToStorage(recipes: Recipe[]) {
  safeWriteToStorage(RECIPES_STORAGE_KEY, recipes);
}

export function loadSelectedRecipesFromStorage(): Recipe[] {
  return normalizeRecipes(
    safeReadFromStorage<Recipe[]>(SELECTED_RECIPES_STORAGE_KEY, []),
  );
}

export function saveSelectedRecipesToStorage(recipes: Recipe[]) {
  safeWriteToStorage(SELECTED_RECIPES_STORAGE_KEY, recipes);
}

export function loadCheckedItemsFromStorage(): string[] {
  return safeReadFromStorage<string[]>(CHECKED_ITEMS_STORAGE_KEY, []);
}

export function saveCheckedItemsToStorage(itemIds: string[]) {
  safeWriteToStorage(CHECKED_ITEMS_STORAGE_KEY, itemIds);
}

export function loadManualIngredientsFromStorage(): ParsedIngredient[] {
  return safeReadFromStorage<ParsedIngredient[]>(MANUAL_ITEMS_STORAGE_KEY, []);
}

export function saveManualIngredientsToStorage(
  ingredients: ParsedIngredient[],
) {
  safeWriteToStorage(MANUAL_ITEMS_STORAGE_KEY, ingredients);
}

export function clearBrokenStorage() {
  window.localStorage.removeItem(RECIPES_STORAGE_KEY);
  window.localStorage.removeItem(SELECTED_RECIPES_STORAGE_KEY);
  window.localStorage.removeItem(CHECKED_ITEMS_STORAGE_KEY);
  window.localStorage.removeItem(MANUAL_ITEMS_STORAGE_KEY);
}
