"use client";

import { useState } from "react";
import { parseIngredientLines } from "@/lib/ingredients";

import type { Recipe } from "@/lib/types";

type RecipeFormScreenProps = {
  title: string;
  initialRecipe?: Recipe;
  onBack: () => void;
  onSave: (recipe: Recipe) => void;
};

export function RecipeFormScreen({
  title,
  initialRecipe,
  onBack,
  onSave,
}: RecipeFormScreenProps) {
  const [name, setName] = useState(initialRecipe?.name ?? "");
  const [rawIngredients, setRawIngredients] = useState(
    initialRecipe?.rawIngredients ?? "",
  );
  const [tagsInput, setTagsInput] = useState(
    initialRecipe?.tags?.join(", ") ?? "",
  );
  const [error, setError] = useState("");

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
