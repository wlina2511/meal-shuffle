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
import {
  loadCheckedItemsFromStorage,
  loadManualIngredientsFromStorage,
  loadRecipesFromStorage,
  loadSelectedRecipesFromStorage,
  saveCheckedItemsToStorage,
  saveManualIngredientsToStorage,
  saveRecipesToStorage,
  saveSelectedRecipesToStorage,
} from "@/lib/storage";
import { importRecipesFromText } from "@/lib/importRecipes";

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
    setRecipes(loadRecipesFromStorage());
    setSelectedRecipes(loadSelectedRecipesFromStorage());
    setCheckedShoppingItems(loadCheckedItemsFromStorage());
    setManualShoppingIngredients(loadManualIngredientsFromStorage());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    saveRecipesToStorage(recipes);
  }, [recipes, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    saveSelectedRecipesToStorage(selectedRecipes);
  }, [selectedRecipes, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    saveCheckedItemsToStorage(checkedShoppingItems);
  }, [checkedShoppingItems, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    saveManualIngredientsToStorage(manualShoppingIngredients);
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
  function importRecipes(text: string) {
    const importedRecipes = importRecipesFromText(text);

    if (importedRecipes.length === 0) {
      return 0;
    }

    setRecipes((currentRecipes) => [...importedRecipes, ...currentRecipes]);

    return importedRecipes.length;
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
        onImportRecipes={importRecipes}
        onAddRecipe={() => setScreen("add-recipe")}
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
      onOpenRecipes={() => setScreen("recipes")}
      onGeneratePlan={() => setScreen("generate-plan")}
      onOpenShoppingList={() => setScreen("shopping-list")}
      onClearMealPlan={clearMealPlan}
    />
  );
}
