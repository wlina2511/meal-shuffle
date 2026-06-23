"use client";

import { useEffect, useState } from "react";
import {
  formatIngredient,
  formatShoppingListForText,
  formatShoppingListItem,
  generateShoppingList,
  groupShoppingListByCategory,
  parseIngredientLine,
  parseIngredientLines,
  type ParsedIngredient,
  type ShoppingListItem,
} from "@/lib/ingredients";

type Recipe = {
  id: string;
  name: string;
  rawIngredients: string;
  ingredients: ParsedIngredient[];
  tags: string[];
};

type Screen =
  | "home"
  | "recipes"
  | "add-recipe"
  | "edit-recipe"
  | "generate-plan"
  | "shopping-list";

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
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
        <header className="mb-8">
          <p className="mb-2 text-sm text-neutral-400">Meal Shuffle</p>

          <h1 className="text-3xl font-bold tracking-tight">
            Tes repas de la semaine, sans réfléchir.
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Ajoute tes recettes habituelles, tire quelques repas au hasard, puis
            génère automatiquement ta liste de courses.
          </p>

          <p className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-xs leading-5 text-neutral-500">
            Mode sans compte : tes recettes sont sauvegardées uniquement sur cet
            appareil. La sauvegarde cloud sera optionnelle plus tard.
          </p>
        </header>

        <section className="mb-6 rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Recettes enregistrées</p>
              <p className="mt-1 text-4xl font-bold">{recipes.length}</p>
            </div>

            <div className="rounded-2xl bg-neutral-800 px-3 py-2 text-sm text-neutral-300">
              Local
            </div>
          </div>

          <p className="text-sm leading-6 text-neutral-400">
            Commence par ajouter quelques recettes que tu manges vraiment. 10 à
            20 plats suffisent déjà à rendre l’app utile.
          </p>
        </section>
        <section className="grid gap-3">
          <button
            onClick={() => setScreen("add-recipe")}
            className="rounded-2xl bg-neutral-50 px-5 py-4 text-left text-base font-semibold text-neutral-950"
          >
            Ajouter une recette
          </button>

          <button
            onClick={() => setScreen("recipes")}
            disabled={recipes.length === 0}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4 text-left text-base font-semibold text-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mes recettes
          </button>

          <button
            onClick={() => setScreen("generate-plan")}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4 text-left text-base font-semibold text-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={recipes.length === 0}
          >
            Générer ma semaine
          </button>

          <button
            onClick={() => setScreen("shopping-list")}
            disabled={selectedRecipes.length === 0}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4 text-left text-base font-semibold text-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Voir la liste de courses
          </button>
        </section>

        {selectedRecipes.length > 0 && (
          <section className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-neutral-300">
                Repas sélectionnés
              </h2>

              <button
                onClick={clearMealPlan}
                className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs font-medium text-neutral-300"
              >
                Vider
              </button>
            </div>

            <div className="grid gap-3">
              {selectedRecipes.map((recipe, index) => (
                <div
                  key={recipe.id}
                  className="flex items-center justify-between rounded-2xl bg-neutral-950 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-neutral-50">{recipe.name}</p>

                    {recipe.tags.length > 0 && (
                      <p className="mt-1 text-xs text-neutral-500">
                        {recipe.tags.join(" · ")}
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-neutral-500">#{index + 1}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-auto pt-8 text-xs leading-5 text-neutral-500">
          Les données sont stockées localement dans ce navigateur.
        </footer>
      </div>
    </main>
  );
}

function RecipeFormScreen({
  title,
  initialRecipe,
  onBack,
  onSave,
}: {
  title: string;
  initialRecipe?: Recipe;
  onBack: () => void;
  onSave: (recipe: Recipe) => void;
}) {
  const [name, setName] = useState(initialRecipe?.name ?? "");
  const [rawIngredients, setRawIngredients] = useState(
    initialRecipe?.rawIngredients ?? "",
  );
  const [error, setError] = useState("");
  const [tagsInput, setTagsInput] = useState(
    initialRecipe?.tags?.join(", ") ?? "",
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedIngredients = rawIngredients.trim();

    if (!trimmedName) {
      setError("Donne un nom à ta recette.");
      return;
    }

    if (!trimmedIngredients) {
      setError("Ajoute au moins un ingrédient.");
      return;
    }

    const parsedIngredients = parseIngredientLines(trimmedIngredients);
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    onSave({
      id: initialRecipe?.id ?? crypto.randomUUID(),
      name: trimmedName,
      rawIngredients: trimmedIngredients,
      ingredients: parsedIngredients,
      tags,
    });
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
        <header className="mb-6">
          <button
            onClick={onBack}
            className="mb-6 text-sm font-medium text-neutral-400"
          >
            ← Retour
          </button>

          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>

          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Saisis les ingrédients ligne par ligne. Exemple : “500g pâtes”, “2
            tomates”, “1 oignon”.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-neutral-300">
              Nom de la recette
            </span>

            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              placeholder="Ex : Pâtes bolo"
              className="rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-neutral-50 outline-none placeholder:text-neutral-600 focus:border-neutral-500"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-neutral-300">Tags</span>

            <input
              value={tagsInput}
              onChange={(event) => {
                setTagsInput(event.target.value);
                setError("");
              }}
              placeholder="Ex : rapide, poulet, riz"
              className="rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-neutral-50 outline-none placeholder:text-neutral-600 focus:border-neutral-500"
            />

            <span className="text-xs leading-5 text-neutral-500">
              Sépare les tags avec des virgules.
            </span>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-neutral-300">
              Ingrédients
            </span>

            <textarea
              value={rawIngredients}
              onChange={(event) => {
                setRawIngredients(event.target.value);
                setError("");
              }}
              placeholder={"500g pâtes\n400g bœuf haché\n2 tomates\n1 oignon"}
              rows={8}
              className="resize-none rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-neutral-50 outline-none placeholder:text-neutral-600 focus:border-neutral-500"
            />
          </label>

          {error && (
            <p className="rounded-2xl border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="rounded-2xl bg-neutral-50 px-5 py-4 text-left text-base font-semibold text-neutral-950"
          >
            {initialRecipe
              ? "Enregistrer les modifications"
              : "Enregistrer la recette"}
          </button>
        </form>
      </div>
    </main>
  );
}

function GeneratePlanScreen({
  recipes,
  onBack,
  onGenerate,
}: {
  recipes: Recipe[];
  onBack: () => void;
  onGenerate: (
    mealCount: number,
    excludedRecipeIds: string[],
    selectedTag: string,
  ) => void;
}) {
  const [mealCount, setMealCount] = useState(Math.min(5, recipes.length));
  const [error, setError] = useState("");
  const [excludedRecipeIds, setExcludedRecipeIds] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [pressedBulkAction, setPressedBulkAction] = useState<
    "include" | "exclude" | null
  >(null);
  const availableTags = Array.from(
    new Set(recipes.flatMap((recipe) => recipe.tags)),
  ).sort((a, b) => a.localeCompare(b));
  const availableRecipes = recipes.filter((recipe) => {
    const isNotExcluded = !excludedRecipeIds.includes(recipe.id);
    const matchesTag = selectedTag ? recipe.tags.includes(selectedTag) : true;

    return isNotExcluded && matchesTag;
  });

  useEffect(() => {
    if (availableRecipes.length === 0) {
      setMealCount(1);
      return;
    }

    setMealCount((currentMealCount) => {
      if (currentMealCount > availableRecipes.length) {
        return availableRecipes.length;
      }

      if (currentMealCount < 1) {
        return 1;
      }

      return currentMealCount;
    });
  }, [availableRecipes.length]);

  function showPressedBulkAction(action: "include" | "exclude") {
    setPressedBulkAction(action);

    window.setTimeout(() => {
      setPressedBulkAction(null);
    }, 150);
  }

  function excludeAllRecipes() {
    setExcludedRecipeIds(recipes.map((recipe) => recipe.id));
    setMealCount(1);
    setError("");
    showPressedBulkAction("exclude");
  }

  function includeAllRecipes() {
    setExcludedRecipeIds([]);

    const recipesMatchingCurrentTag = recipes.filter((recipe) =>
      selectedTag ? recipe.tags.includes(selectedTag) : true,
    );

    setMealCount(Math.max(1, recipesMatchingCurrentTag.length));
    setError("");
    showPressedBulkAction("include");
  }
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (recipes.length === 0) {
      setError("Ajoute au moins une recette avant de générer une semaine.");
      return;
    }

    if (mealCount < 1) {
      setError("Choisis au moins un repas.");
      return;
    }

    if (availableRecipes.length === 0) {
      setError("Tu as exclu toutes les recettes.");
      return;
    }

    if (mealCount > availableRecipes.length) {
      setError(
        `Tu demandes ${mealCount} repas, mais seulement ${
          availableRecipes.length
        } recette${availableRecipes.length > 1 ? "s sont disponibles" : " est disponible"}.`,
      );
      return;
    }

    onGenerate(mealCount, excludedRecipeIds, selectedTag);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
        <header className="mb-6">
          <button
            onClick={onBack}
            className="mb-6 text-sm font-medium text-neutral-400"
          >
            ← Retour
          </button>

          <h1 className="text-3xl font-bold tracking-tight">
            Générer ma semaine
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Choisis combien de repas tirer parmi tes recettes enregistrées.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
            <p className="text-sm text-neutral-400">
              Recettes disponibles après exclusions
            </p>{" "}
            <p className="mt-1 text-4xl font-bold">
              {availableRecipes.length}
            </p>{" "}
          </section>

          {availableTags.length > 0 && (
            <label className="grid gap-2">
              <span className="text-sm font-medium text-neutral-300">
                Filtrer par tag
              </span>

              <select
                value={selectedTag}
                onChange={(event) => {
                  const nextTag = event.target.value;

                  setSelectedTag(nextTag);

                  const recipesMatchingNextTag = recipes.filter((recipe) =>
                    nextTag ? recipe.tags.includes(nextTag) : true,
                  );

                  const recipesMatchingNextTagAndNotExcluded =
                    recipesMatchingNextTag.filter(
                      (recipe) => !excludedRecipeIds.includes(recipe.id),
                    );

                  setMealCount(
                    Math.max(1, recipesMatchingNextTagAndNotExcluded.length),
                  );
                  setError("");
                }}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-neutral-50 outline-none focus:border-neutral-500"
              >
                <option value="">Tous les tags</option>

                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="grid gap-2">
            <span className="text-sm font-medium text-neutral-300">
              Nombre de repas à générer
            </span>

            <input
              type="number"
              min={1}
              max={Math.max(1, availableRecipes.length)}
              value={mealCount}
              disabled={availableRecipes.length === 0}
              onChange={(event) => {
                const nextValue = Number(event.target.value);

                if (availableRecipes.length === 0) {
                  setMealCount(1);
                  return;
                }

                setMealCount(
                  Math.min(Math.max(nextValue, 1), availableRecipes.length),
                );

                setError("");
              }}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-neutral-50 outline-none placeholder:text-neutral-600 focus:border-neutral-500"
            />
          </label>

          <section className="grid gap-3">
            <div>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold text-neutral-300">
                  Exclure des recettes
                </h2>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={includeAllRecipes}
                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                      pressedBulkAction === "include"
                        ? "border-neutral-50 bg-neutral-50 text-neutral-950"
                        : "border-neutral-700 bg-neutral-950 text-neutral-300"
                    }`}
                  >
                    Tout inclure
                  </button>

                  <button
                    type="button"
                    onClick={excludeAllRecipes}
                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                      pressedBulkAction === "exclude"
                        ? "border-neutral-50 bg-neutral-50 text-neutral-950"
                        : "border-neutral-700 bg-neutral-950 text-neutral-300"
                    }`}
                  >
                    Tout exclure
                  </button>
                </div>
              </div>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Décoche les plats que tu ne veux pas voir sortir cette semaine.
              </p>
            </div>

            <div className="grid gap-2">
              {recipes.map((recipe) => {
                const excluded = excludedRecipeIds.includes(recipe.id);

                return (
                  <button
                    type="button"
                    key={recipe.id}
                    onClick={() => {
                      setExcludedRecipeIds((currentIds) =>
                        currentIds.includes(recipe.id)
                          ? currentIds.filter((id) => id !== recipe.id)
                          : [...currentIds, recipe.id],
                      );
                      setError("");
                    }}
                    className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-left"
                  >
                    <span className="grid gap-1">
                      <span
                        className={
                          excluded
                            ? "text-sm font-medium text-neutral-500 line-through"
                            : "text-sm font-medium text-neutral-50"
                        }
                      >
                        {recipe.name}
                      </span>

                      {recipe.tags.length > 0 && (
                        <span className="text-xs text-neutral-500">
                          {recipe.tags.join(" · ")}
                        </span>
                      )}
                    </span>

                    <span className="text-xs text-neutral-500">
                      {excluded ? "Exclue" : "Incluse"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {error && (
            <p className="rounded-2xl border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="rounded-2xl bg-neutral-50 px-5 py-4 text-left text-base font-semibold text-neutral-950"
          >
            Tirer les repas
          </button>
        </form>
      </div>
    </main>
  );
}

function ShoppingListScreen({
  items,
  checkedItemIds,
  onToggleItem,
  onAddManualIngredient,
  onBack,
}: {
  items: ShoppingListItem[];
  checkedItemIds: string[];
  onToggleItem: (itemId: string) => void;
  onAddManualIngredient: (rawLine: string) => void;
  onBack: () => void;
}) {
  const checkedCount = checkedItemIds.length;
  const totalCount = items.length;
  const categories = groupShoppingListByCategory(items);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [manualIngredientInput, setManualIngredientInput] = useState("");
  const [manualAddFeedback, setManualAddFeedback] = useState("");
  async function copyShoppingList() {
    const text = formatShoppingListForText(categories);

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");

      window.setTimeout(() => {
        setCopyStatus("idle");
      }, 1500);
    } catch {
      setCopyStatus("error");

      window.setTimeout(() => {
        setCopyStatus("idle");
      }, 2000);
    }
  }
  function handleAddManualIngredient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedValue = manualIngredientInput.trim();

    if (!trimmedValue) {
      return;
    }

    onAddManualIngredient(trimmedValue);
    setManualIngredientInput("");
    setManualAddFeedback(`${trimmedValue} bien ajouté à la liste de courses`);

    window.setTimeout(() => {
      setManualAddFeedback("");
    }, 1800);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
        <header className="mb-6">
          <button
            onClick={onBack}
            className="mb-6 text-sm font-medium text-neutral-400"
          >
            ← Retour
          </button>

          <h1 className="text-3xl font-bold tracking-tight">
            Liste de courses
          </h1>
          {items.length > 0 && (
            <button
              onClick={copyShoppingList}
              className={`mt-4 rounded-2xl px-5 py-3 text-left text-sm font-semibold transition ${
                copyStatus === "copied"
                  ? "bg-green-950 text-green-200"
                  : copyStatus === "error"
                    ? "bg-red-950 text-red-200"
                    : "bg-neutral-50 text-neutral-950"
              }`}
            >
              {copyStatus === "copied"
                ? "Liste copiée"
                : copyStatus === "error"
                  ? "Copie impossible"
                  : "Copier la liste"}
            </button>
          )}

          <form
            onSubmit={handleAddManualIngredient}
            className="mb-6 grid gap-3"
          >
            <label className="grid gap-2">
              <span className="text-sm font-medium text-neutral-300">
                Ajouter un article
              </span>

              <div className="flex gap-2">
                <input
                  value={manualIngredientInput}
                  onChange={(event) =>
                    setManualIngredientInput(event.target.value)
                  }
                  placeholder="Ex : 2 tomates"
                  className="min-w-0 flex-1 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-neutral-50 outline-none placeholder:text-neutral-600 focus:border-neutral-500"
                />

                <button
                  type="submit"
                  className="rounded-2xl bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-950"
                >
                  Ajouter
                </button>
              </div>
            </label>
          </form>

          {manualAddFeedback && (
            <p className="mb-6 rounded-2xl border border-green-900 bg-green-950 px-4 py-3 text-sm text-green-200">
              {manualAddFeedback}
            </p>
          )}

          <p className="mt-3 text-sm leading-6 text-neutral-400">
            {checkedCount} / {totalCount} ingrédient
            {totalCount > 1 ? "s" : ""} coché
            {totalCount > 1 ? "s" : ""}.
          </p>
        </header>

        {items.length === 0 ? (
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
            <p className="text-sm leading-6 text-neutral-400">
              Aucune liste de courses pour le moment. Génère d’abord des repas.
            </p>
          </section>
        ) : (
          <section className="grid gap-6">
            {categories.map((category) => (
              <section key={category.name} className="grid gap-3">
                <h2 className="text-sm font-semibold text-neutral-300">
                  {category.name}
                </h2>

                <div className="grid gap-3">
                  {category.items.map((item) => {
                    const checked = checkedItemIds.includes(item.id);

                    return (
                      <button
                        key={item.id}
                        onClick={() => onToggleItem(item.id)}
                        className="flex items-start gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-left"
                      >
                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
                            checked
                              ? "border-neutral-50 bg-neutral-50 text-neutral-950"
                              : "border-neutral-700 text-transparent"
                          }`}
                        >
                          ✓
                        </span>

                        <span className="grid gap-1">
                          <span
                            className={`font-medium ${
                              checked
                                ? "text-neutral-500 line-through"
                                : "text-neutral-50"
                            }`}
                          >
                            {formatShoppingListItem(item)}
                          </span>

                          {item.rawLines.length > 1 && (
                            <span className="text-xs leading-5 text-neutral-500">
                              Fusionné depuis {item.rawLines.length} lignes
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function RecipesScreen({
  recipes,
  onBack,
  onEditRecipe,
  onDeleteRecipe,
}: {
  recipes: Recipe[];
  onBack: () => void;
  onEditRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (recipeId: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
        <header className="mb-6">
          <button
            onClick={onBack}
            className="mb-6 text-sm font-medium text-neutral-400"
          >
            ← Retour
          </button>

          <h1 className="text-3xl font-bold tracking-tight">Mes recettes</h1>

          <p className="mt-3 text-sm leading-6 text-neutral-400">
            {recipes.length} recette{recipes.length > 1 ? "s" : ""} enregistrée
            {recipes.length > 1 ? "s" : ""}.
          </p>
        </header>

        <label className="mb-6 grid gap-2">
          <span className="text-sm font-medium text-neutral-300">
            Rechercher
          </span>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ex : pâtes, poulet, curry..."
            className="rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-neutral-50 outline-none placeholder:text-neutral-600 focus:border-neutral-500"
          />
        </label>

        {filteredRecipes.length === 0 ? (
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
            <p className="text-sm leading-6 text-neutral-400">
              Aucune recette ne correspond à cette recherche.
            </p>
          </section>
        ) : (
          <section className="grid gap-3">
            {filteredRecipes.map((recipe) => (
              <article
                key={recipe.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-semibold text-neutral-50">
                    {recipe.name}
                  </h2>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => onEditRecipe(recipe)}
                      className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs font-medium text-neutral-300"
                    >
                      Modifier
                    </button>

                    <button
                      onClick={() => onDeleteRecipe(recipe.id)}
                      className="rounded-xl border border-red-900 bg-red-950 px-3 py-2 text-xs font-medium text-red-200"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                {recipe.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recipe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1 text-xs text-neutral-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 grid gap-2">
                  {recipe.ingredients.slice(0, 4).map((ingredient) => (
                    <p
                      key={ingredient.id}
                      className="text-sm leading-5 text-neutral-400"
                    >
                      {formatIngredient(ingredient)}
                    </p>
                  ))}

                  {recipe.ingredients.length > 4 && (
                    <p className="text-sm text-neutral-500">
                      + {recipe.ingredients.length - 4} ingrédient
                      {recipe.ingredients.length - 4 > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
