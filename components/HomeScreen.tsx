import type { Recipe } from "@/lib/types";

type HomeScreenProps = {
  recipes: Recipe[];
  selectedRecipes: Recipe[];
  onOpenRecipes: () => void;
  onGeneratePlan: () => void;
  onOpenShoppingList: () => void;
  onClearMealPlan: () => void;
};

export function HomeScreen({
  recipes,
  selectedRecipes,
  onOpenRecipes,
  onGeneratePlan,
  onOpenShoppingList,
  onClearMealPlan,
}: HomeScreenProps) {
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
            onClick={onOpenRecipes}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4 text-left text-base font-semibold text-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mes recettes
          </button>

          <button
            onClick={onGeneratePlan}
            disabled={recipes.length === 0}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4 text-left text-base font-semibold text-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Générer ma semaine
          </button>

          <button
            onClick={onOpenShoppingList}
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
                onClick={onClearMealPlan}
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
