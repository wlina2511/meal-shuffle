"use client";

import { useEffect, useState } from "react";
import {
  generateShoppingList,
  parseIngredientLine,
  type ParsedIngredient,
} from "@/lib/ingredients";
import { HomeScreen } from "@/components/HomeScreen";
import { RecipesScreen } from "@/components/RecipesScreen";
import { RecipeFormScreen } from "@/components/RecipeFormScreen";
import { GeneratePlanScreen } from "@/components/GeneratePlanScreen";
import { ShoppingListScreen } from "@/components/ShoppingListScreen";
import type { Recipe, Screen } from "@/lib/types";

const RECIPES_STORAGE_KEY = "meal-shuffle-recipes";
const SELECTED_RECIPES_STORAGE_KEY = "meal-shuffle-selected-recipes";
const CHECKED_ITEMS_STORAGE_KEY = "meal-shuffle-checked-items";
const MANUAL_ITEMS_STORAGE_KEY = "meal-shuffle-manual-items";

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>("home");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [checkedShoppingItems, setCheckedShoppingItems] = useState<string[]>(
    [],
  );
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [manualShoppingIngredients, setManualShoppingIngredients] = useState<
    ParsedIngredient[]
  >([]);
  const shoppingList = generateShoppingList([
    ...selectedRecipes.flatMap((recipe) => recipe.ingredients),
    ...manualShoppingIngredients,
  ]);

  useEffect(() => {
    try {
      const storedRecipes = window.localStorage.getItem(RECIPES_STORAGE_KEY);
      const storedSelectedRecipes = window.localStorage.getItem(
        SELECTED_RECIPES_STORAGE_KEY,
      );
      const storedCheckedItems = window.localStorage.getItem(
        CHECKED_ITEMS_STORAGE_KEY,
      );
      const storedManualItems = window.localStorage.getItem(
        MANUAL_ITEMS_STORAGE_KEY,
      );

      if (storedRecipes) {
        const parsedRecipes = JSON.parse(storedRecipes) as Recipe[];

        setRecipes(
          parsedRecipes.map((recipe) => ({
            ...recipe,
            tags: recipe.tags ?? [],
          })),
        );
      }

      if (storedSelectedRecipes) {
        const parsedSelectedRecipes = JSON.parse(
          storedSelectedRecipes,
        ) as Recipe[];

        setSelectedRecipes(
          parsedSelectedRecipes.map((recipe) => ({
            ...recipe,
            tags: recipe.tags ?? [],
          })),
        );
      }

      if (storedCheckedItems) {
        setCheckedShoppingItems(JSON.parse(storedCheckedItems));
      }
      if (storedManualItems) {
        setManualShoppingIngredients(JSON.parse(storedManualItems));
      }
    } catch {
      window.localStorage.removeItem(RECIPES_STORAGE_KEY);
      window.localStorage.removeItem(SELECTED_RECIPES_STORAGE_KEY);
      window.localStorage.removeItem(CHECKED_ITEMS_STORAGE_KEY);
      window.localStorage.removeItem(MANUAL_ITEMS_STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    window.localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
  }, [recipes, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    window.localStorage.setItem(
      SELECTED_RECIPES_STORAGE_KEY,
      JSON.stringify(selectedRecipes),
    );
  }, [selectedRecipes, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    window.localStorage.setItem(
      CHECKED_ITEMS_STORAGE_KEY,
      JSON.stringify(checkedShoppingItems),
    );
  }, [checkedShoppingItems, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    window.localStorage.setItem(
      MANUAL_ITEMS_STORAGE_KEY,
      JSON.stringify(manualShoppingIngredients),
    );
  }, [manualShoppingIngredients, isLoaded]);

  function addRecipe(recipe: Recipe) {
    setRecipes((currentRecipes) => [recipe, ...currentRecipes]);
    setScreen("home");
  }

  function updateRecipe(updatedRecipe: Recipe) {
    setRecipes((currentRecipes) =>
      currentRecipes.map((recipe) =>
        recipe.id === updatedRecipe.id ? updatedRecipe : recipe,
      ),
    );

    setSelectedRecipes((currentSelectedRecipes) =>
      currentSelectedRecipes.map((recipe) =>
        recipe.id === updatedRecipe.id ? updatedRecipe : recipe,
      ),
    );

    setCheckedShoppingItems([]);
    setEditingRecipe(null);
    setScreen("home");
  }

  function deleteRecipe(recipeId: string) {
    setRecipes((currentRecipes) =>
      currentRecipes.filter((recipe) => recipe.id !== recipeId),
    );

    setSelectedRecipes((currentSelectedRecipes) =>
      currentSelectedRecipes.filter((recipe) => recipe.id !== recipeId),
    );

    setCheckedShoppingItems([]);
  }

  function generateMealPlan(
    mealCount: number,
    excludedRecipeIds: string[],
    selectedTag: string,
  ) {
    const availableRecipes = recipes.filter((recipe) => {
      const isNotExcluded = !excludedRecipeIds.includes(recipe.id);
      const matchesTag = selectedTag ? recipe.tags.includes(selectedTag) : true;

      return isNotExcluded && matchesTag;
    });

    const shuffledRecipes = [...availableRecipes].sort(
      () => Math.random() - 0.5,
    );
    const pickedRecipes = shuffledRecipes.slice(0, mealCount);

    setSelectedRecipes(pickedRecipes);
    setManualShoppingIngredients([]);
    setCheckedShoppingItems([]);
    setScreen("home");
  }

  function clearMealPlan() {
    setSelectedRecipes([]);
    setCheckedShoppingItems([]);
    setManualShoppingIngredients([]);
  }

  function addManualShoppingIngredient(rawLine: string) {
    const parsedIngredient = parseIngredientLine(rawLine);

    if (!parsedIngredient) {
      return;
    }

    setManualShoppingIngredients((currentIngredients) => [
      ...currentIngredients,
      parsedIngredient,
    ]);

    setCheckedShoppingItems([]);
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-50">
        <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-5">
          <p className="text-sm text-neutral-400">Chargement...</p>
        </div>
      </main>
    );
  }

  if (screen === "add-recipe") {
    return (
      <RecipeFormScreen
        title="Ajouter une recette"
        onBack={() => setScreen("home")}
        onSave={addRecipe}
      />
    );
  }

  if (screen === "edit-recipe" && editingRecipe) {
    return (
      <RecipeFormScreen
        title="Modifier la recette"
        initialRecipe={editingRecipe}
        onBack={() => {
          setEditingRecipe(null);
          setScreen("home");
        }}
        onSave={updateRecipe}
      />
    );
  }
  if (screen === "recipes") {
    return (
      <RecipesScreen
        recipes={recipes}
        onBack={() => setScreen("home")}
        onEditRecipe={(recipe) => {
          setEditingRecipe(recipe);
          setScreen("edit-recipe");
        }}
        onDeleteRecipe={deleteRecipe}
      />
    );
  }
  if (screen === "generate-plan") {
    return (
      <GeneratePlanScreen
        recipes={recipes}
        onBack={() => setScreen("home")}
        onGenerate={generateMealPlan}
      />
    );
  }

  if (screen === "shopping-list") {
    return (
      <ShoppingListScreen
        items={shoppingList}
        checkedItemIds={checkedShoppingItems}
        onToggleItem={(itemId) => {
          setCheckedShoppingItems((currentIds) =>
            currentIds.includes(itemId)
              ? currentIds.filter((id) => id !== itemId)
              : [...currentIds, itemId],
          );
        }}
        onAddManualIngredient={addManualShoppingIngredient}
        onBack={() => setScreen("home")}
      />
    );
  }

  return (
    <HomeScreen
      recipes={recipes}
      selectedRecipes={selectedRecipes}
      onAddRecipe={() => setScreen("add-recipe")}
      onOpenRecipes={() => setScreen("recipes")}
      onGeneratePlan={() => setScreen("generate-plan")}
      onOpenShoppingList={() => setScreen("shopping-list")}
      onClearMealPlan={clearMealPlan}
    />
  );
}
