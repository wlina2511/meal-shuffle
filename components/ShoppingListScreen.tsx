"use client";

import { useState } from "react";
import {
  formatShoppingListForText,
  formatShoppingListItem,
  groupShoppingListByCategory,
  type ShoppingListItem,
} from "@/lib/ingredients";

type ShoppingListScreenProps = {
  items: ShoppingListItem[];
  checkedItemIds: string[];
  onToggleItem: (itemId: string) => void;
  onAddManualIngredient: (rawLine: string) => void;
  onBack: () => void;
  onClearCheckedItems: () => void;
};

export function ShoppingListScreen({
  items,
  checkedItemIds,
  onToggleItem,
  onClearCheckedItems,
  onAddManualIngredient,
  onBack,
}: ShoppingListScreenProps) {
  const checkedCount = checkedItemIds.length;
  const totalCount = items.length;
  const categories = groupShoppingListByCategory(items);
  const uncheckedItems = items.filter(
    (item) => !checkedItemIds.includes(item.id),
  );
  const uncheckedCategories = groupShoppingListByCategory(uncheckedItems);

  const [copyStatus, setCopyStatus] = useState("");
  const [manualIngredientInput, setManualIngredientInput] = useState("");
  const [manualAddFeedback, setManualAddFeedback] = useState("");

  async function copyShoppingList() {
    const text = formatShoppingListForText(categories);

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Liste copiée.");

      window.setTimeout(() => {
        setCopyStatus("");
      }, 1500);
    } catch {
      setCopyStatus("Impossible de copier la liste.");

      window.setTimeout(() => {
        setCopyStatus("");
      }, 2000);
    }
  }
  async function copyUncheckedShoppingList() {
    if (uncheckedItems.length === 0) {
      setCopyStatus("Tous les articles sont déjà cochés.");
      return;
    }

    const text = formatShoppingListForText(uncheckedCategories);
    await navigator.clipboard.writeText(text);

    setCopyStatus("Articles restants copiés.");
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

          <p className="mt-3 text-sm leading-6 text-neutral-400">
            {checkedCount} / {totalCount} ingrédient
            {totalCount > 1 ? "s" : ""} coché
            {totalCount > 1 ? "s" : ""}.
          </p>

          {items.length > 0 && (
            <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-neutral-400">
                  {checkedCount} / {totalCount} article
                  {totalCount > 1 ? "s" : ""} coché
                  {checkedCount > 1 ? "s" : ""}
                </p>

                {checkedCount > 0 && (
                  <button
                    type="button"
                    onClick={onClearCheckedItems}
                    className="text-sm font-medium text-neutral-400 underline underline-offset-4 hover:text-neutral-200"
                  >
                    Tout décocher
                  </button>
                )}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={copyShoppingList}
                  disabled={items.length === 0}
                  className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Copier toute la liste
                </button>

                <button
                  type="button"
                  onClick={copyUncheckedShoppingList}
                  disabled={uncheckedItems.length === 0}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm font-semibold text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Copier les restants
                </button>
              </div>

              {copyStatus && (
                <p className="mt-3 text-sm text-emerald-400">{copyStatus}</p>
              )}
            </div>
          )}
        </header>

        <form onSubmit={handleAddManualIngredient} className="mb-6 grid gap-3">
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
