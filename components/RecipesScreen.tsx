"use client";

import { useState } from "react";
import { formatIngredient } from "@/lib/ingredients";
import type { Recipe } from "@/lib/types";

type RecipesScreenProps = {
  recipes: Recipe[];
  onBack: () => void;
  onEditRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (recipeId: string) => void;
};

export function RecipesScreen({
  recipes,
  onBack,
  onEditRecipe,
  onDeleteRecipe,
}: RecipesScreenProps) {
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
