import type { Recipe } from "@/lib/types";

function formatRecipeTags(tags: string[]) {
  if (tags.length === 0) {
    return "";
  }

  return `tags: ${tags.join(", ")}`;
}

export function exportRecipesToText(recipes: Recipe[]) {
  return recipes
    .map((recipe) => {
      const lines = [
        `# ${recipe.name}`,
        formatRecipeTags(recipe.tags),
        recipe.rawIngredients.trim(),
      ].filter(Boolean);

      return lines.join("\n");
    })
    .join("\n\n");
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
