import type { ParsedIngredient } from "@/lib/ingredients";

export type Recipe = {
  id: string;
  name: string;
  rawIngredients: string;
  ingredients: ParsedIngredient[];
  tags: string[];
};

export type Screen =
  | "home"
  | "recipes"
  | "add-recipe"
  | "edit-recipe"
  | "generate-plan"
  | "shopping-list";
