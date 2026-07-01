"use client";

import { useState } from "react";
import { formatIngredient } from "@/lib/ingredients";
import type { Recipe } from "@/lib/types";
import { downloadTextFile, exportRecipesToText } from "@/lib/exportRecipes";

type RecipesScreenProps = {
  recipes: Recipe[];
  onBack: () => void;
  onEditRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (recipeId: string) => void;
  onImportRecipes: (text: string) => number;
  onAddRecipe: () => void;
};

export function RecipesScreen({
  recipes,
  onBack,
  onEditRecipe,
  onDeleteRecipe,
  onAddRecipe,
  onImportRecipes,
}: RecipesScreenProps) {
  const [search, setSearch] = useState("");
  const [importFeedback, setImportFeedback] = useState("");
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const [isImportOpen, setIsImportOpen] = useState(false);
  async function handleImportFile(file: File | null) {
    if (!file) return;

    const text = await file.text();
    const importedCount = onImportRecipes(text);

    if (importedCount === 0) {
      setImportFeedback(
        "Aucune recette importée. Vérifie le format du fichier.",
      );
      return;
    }

    setImportFeedback(`${importedCount} recette(s) importée(s).`);
  }
  function handleExportRecipes() {
    if (recipes.length === 0) {
      return;
    }

    const text = exportRecipesToText(recipes);

    downloadTextFile("meal-shuffle-recettes.txt", text);
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

        <div className="mt-4 mb-6 flex flex-wrap justify-start gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onAddRecipe}
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            Ajouter une recette
          </button>

          <button
            type="button"
            onClick={() => setIsImportOpen((currentValue) => !currentValue)}
            className="rounded-full border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-white"
          >
            {isImportOpen ? "Masquer l’import" : "Importer .txt"}
          </button>

          <button
            type="button"
            onClick={handleExportRecipes}
            disabled={recipes.length === 0}
            className="rounded-full border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Exporter .txt
          </button>
        </div>

        {isImportOpen && (
          <section className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm leading-6 text-zinc-400">
              Format attendu : une recette commence par{" "}
              <span className="font-mono text-zinc-200">
                # Nom de la recette
              </span>
              , puis une ligne optionnelle{" "}
              <span className="font-mono text-zinc-200">
                tags: rapide, poulet
              </span>
              , puis les ingrédients.
            </p>

            <label className="mt-4 block">
              <span className="sr-only">Importer un fichier de recettes</span>
              <input
                type="file"
                accept=".txt,text/plain"
                onChange={(event) => {
                  handleImportFile(event.target.files?.[0] ?? null);
                  event.target.value = "";
                }}
                className="block w-full text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zinc-100 hover:file:bg-zinc-700"
              />
            </label>

            {importFeedback && (
              <p className="mt-3 text-sm text-emerald-400">{importFeedback}</p>
            )}
          </section>
        )}

        {!isImportOpen && importFeedback && (
          <p className="mt-2 text-right text-sm text-emerald-400">
            {importFeedback}
          </p>
        )}
        {filteredRecipes.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950 p-6 text-center">
            <p className="text-base font-medium text-neutral-50">
              {recipes.length === 0
                ? "Pas de recettes pour le moment."
                : "Aucune recette ne correspond à ta recherche."}
            </p>

            <p className="mt-2 text-sm text-neutral-400">
              {recipes.length === 0
                ? "Ajoute une recette manuellement ou importe un fichier .txt pour commencer."
                : "Essaie avec un autre mot-clé."}
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
