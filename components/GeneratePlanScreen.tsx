"use client";

import { useEffect, useState } from "react";

import type { Recipe } from "@/lib/types";

type GeneratePlanScreenProps = {
  recipes: Recipe[];
  onBack: () => void;
  onGenerate: (
    mealCount: number,
    excludedRecipeIds: string[],
    selectedTag: string,
  ) => void;
};

export function GeneratePlanScreen({
  recipes,
  onBack,
  onGenerate,
}: GeneratePlanScreenProps) {
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
    }, 700);
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

    if (availableRecipes.length === 0) {
      setError("Tu as exclu toutes les recettes.");
      return;
    }

    if (mealCount < 1) {
      setError("Choisis au moins un repas.");
      return;
    }

    if (mealCount > availableRecipes.length) {
      setError(
        `Tu demandes ${mealCount} repas, mais seulement ${
          availableRecipes.length
        } recette${
          availableRecipes.length > 1 ? "s sont disponibles" : " est disponible"
        }.`,
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
            </p>
            <p className="mt-1 text-4xl font-bold">{availableRecipes.length}</p>
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
              className="rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-neutral-50 outline-none placeholder:text-neutral-600 focus:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-40"
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
