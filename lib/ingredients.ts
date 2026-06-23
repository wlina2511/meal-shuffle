export type ParsedIngredient = {
  id: string;
  rawLine: string;
  quantity: number | null;
  unit: string | null;
  name: string;
  canonicalName: string;
};

const UNIT_ALIASES: Record<string, string> = {
  g: "g",
  gramme: "g",
  grammes: "g",

  kg: "kg",
  kilo: "kg",
  kilos: "kg",

  ml: "ml",
  cl: "cl",
  l: "l",
  litre: "l",
  litres: "l",

  boite: "boîte",
  boites: "boîte",
  boîte: "boîte",
  boîtes: "boîte",

  pot: "pot",
  pots: "pot",

  paquet: "paquet",
  paquets: "paquet",

  cas: "càs",
  càs: "càs",
  cuillere: "càs",
  cuillère: "càs",

  cac: "càc",
  càc: "càc",
};

const SINGULAR_EXCEPTIONS = new Set([
  "riz",
  "maïs",
  "mais",
  "pois",
  "ananas",
  "houmous",
  "couscous",
  "chips",
]);

function normalizeUnit(unit: string | undefined): string | null {
  if (!unit) {
    return "pièce";
  }

  const cleanedUnit = normalizeText(unit);

  return UNIT_ALIASES[cleanedUnit] ?? cleanedUnit;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}
const INGREDIENT_ALIASES: Record<string, string> = {
  // Pommes de terre
  patate: "pomme de terre",
  patates: "pomme de terre",
  pdt: "pomme de terre",
  "pommes de terre": "pomme de terre",

  // Tomates
  tomates: "tomate",
  "tomate ronde": "tomate",
  "tomates rondes": "tomate",
  "tomate cerises": "tomate cerise",
  "tomates cerise": "tomate cerise",
  "tomates cerises": "tomate cerise",

  // Oignons
  oignons: "oignon",
  "oignons rouges": "oignon rouge",

  // Viande
  "boeuf hache": "bœuf haché",
  "boeuf haché": "bœuf haché",
  "bœuf hache": "bœuf haché",
  "steak hache": "steak haché",
  "steaks haches": "steak haché",
  "steaks hachés": "steak haché",

  // Conserves
  "boite thon": "thon",
  "boites thon": "thon",
  "boîte thon": "thon",
  "boîtes thon": "thon",
  "thon en boite": "thon",
  "thon en boîte": "thon",

  // Haricots / pois chiches
  "haricots rouges": "haricot rouge",
  "pois chiches": "pois chiche",

  // Produits frais
  oeufs: "œuf",
  oeuf: "œuf",
  "fromage rape": "fromage râpé",
  "fromage râpe": "fromage râpé",
  creme: "crème",

  // Sauces
  "sauce salsa": "salsa",
  "pot salsa": "salsa",
  "pot sauce tomate": "sauce tomate",
  "sauce tomate pot": "sauce tomate",
  "tomates concassees": "tomates concassées",

  // Féculents
  pates: "pâtes",
  pate: "pâtes",
  "pain burger": "pain burger",
  "pains burger": "pain burger",
  tortillas: "tortilla",
};
export function normalizeIngredientName(name: string): string {
  const cleanedName = normalizeText(name);

  if (INGREDIENT_ALIASES[cleanedName]) {
    return INGREDIENT_ALIASES[cleanedName];
  }

  if (SINGULAR_EXCEPTIONS.has(cleanedName)) {
    return cleanedName;
  }

  if (cleanedName.endsWith("s")) {
    const singularName = cleanedName.slice(0, -1);

    if (INGREDIENT_ALIASES[singularName]) {
      return INGREDIENT_ALIASES[singularName];
    }

    return singularName;
  }

  return cleanedName;
}

export function parseIngredientLine(line: string): ParsedIngredient | null {
  const rawLine = line.trim();

  if (!rawLine) {
    return null;
  }

  const cleanedLine = rawLine.replace(/\s+/g, " ");

  const compactQuantityRegex = /^(\d+(?:[.,]\d+)?)(g|kg|ml|cl|l)\s+(.+)$/i;

  const standardRegex =
    /^(\d+(?:[.,]\d+)?)\s*(g|kg|ml|cl|l|gramme|grammes|kilo|kilos|litre|litres|boîte|boîtes|boite|boites|pot|pots|paquet|paquets|càs|cas|càc|cac)?\s+(.+)$/i;

  const compactMatch = cleanedLine.match(compactQuantityRegex);
  const standardMatch = cleanedLine.match(standardRegex);

  const match = compactMatch ?? standardMatch;

  if (!match) {
    const name = cleanedLine.toLowerCase();

    return {
      id: crypto.randomUUID(),
      rawLine,
      quantity: null,
      unit: null,
      name,
      canonicalName: normalizeIngredientName(name),
    };
  }

  const quantity = Number(match[1].replace(",", "."));
  const unit = normalizeUnit(match[2]);
  const name = match[3].trim().toLowerCase();

  return {
    id: crypto.randomUUID(),
    rawLine,
    quantity,
    unit,
    name,
    canonicalName: normalizeIngredientName(name),
  };
}

export function parseIngredientLines(
  rawIngredients: string,
): ParsedIngredient[] {
  return rawIngredients
    .split("\n")
    .map(parseIngredientLine)
    .filter(
      (ingredient): ingredient is ParsedIngredient => ingredient !== null,
    );
}

export function formatIngredient(ingredient: ParsedIngredient): string {
  if (ingredient.quantity === null) {
    return ingredient.name;
  }

  if (!ingredient.unit || ingredient.unit === "pièce") {
    return `${ingredient.quantity} ${ingredient.name}`;
  }

  return `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`;
}

export type ShoppingListItem = {
  id: string;
  canonicalName: string;
  displayName: string;
  quantity: number | null;
  unit: string | null;
  rawLines: string[];
};

function pluralizeForDisplay(name: string, quantity: number | null): string {
  if (quantity === null || quantity <= 1) {
    return name;
  }

  const pluralExceptions = new Set([
    "riz",
    "maïs",
    "mais",
    "pois",
    "ananas",
    "houmous",
    "couscous",
    "chips",
  ]);

  if (pluralExceptions.has(name)) {
    return name;
  }

  return `${name}s`;
}

export function formatShoppingListItem(item: ShoppingListItem): string {
  const displayName = pluralizeForDisplay(item.displayName, item.quantity);

  if (item.quantity === null) {
    return displayName;
  }

  if (!item.unit || item.unit === "pièce") {
    return `${item.quantity} ${displayName}`;
  }

  return `${item.quantity} ${item.unit} ${displayName}`;
}

export function generateShoppingList(
  ingredients: ParsedIngredient[],
): ShoppingListItem[] {
  const groupedItems = new Map<string, ShoppingListItem>();

  for (const ingredient of ingredients) {
    const key = `${ingredient.canonicalName}:${ingredient.unit ?? "none"}`;

    if (!groupedItems.has(key)) {
      groupedItems.set(key, {
        id: key,
        canonicalName: ingredient.canonicalName,
        displayName: ingredient.canonicalName,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        rawLines: [ingredient.rawLine],
      });

      continue;
    }

    const currentItem = groupedItems.get(key);

    if (!currentItem) {
      continue;
    }

    currentItem.rawLines.push(ingredient.rawLine);

    if (currentItem.quantity !== null && ingredient.quantity !== null) {
      currentItem.quantity += ingredient.quantity;
    } else {
      currentItem.quantity = null;
    }
  }

  return Array.from(groupedItems.values()).sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );
}

export type ShoppingCategory = {
  name: string;
  items: ShoppingListItem[];
};

const INGREDIENT_CATEGORIES: Record<string, string> = {
  tomate: "Fruits / légumes",
  "tomate cerise": "Fruits / légumes",
  oignon: "Fruits / légumes",
  salade: "Fruits / légumes",
  courgette: "Fruits / légumes",
  poivron: "Fruits / légumes",
  carotte: "Fruits / légumes",
  brocoli: "Fruits / légumes",
  concombre: "Fruits / légumes",
  citron: "Fruits / légumes",
  "pomme de terre": "Fruits / légumes",

  poulet: "Viande / poisson",
  "boeuf hache": "Viande / poisson",
  "bœuf haché": "Viande / poisson",
  saumon: "Viande / poisson",
  thon: "Viande / poisson",
  crevette: "Viande / poisson",
  lardon: "Viande / poisson",
  jambon: "Viande / poisson",
  merguez: "Viande / poisson",
  saucisse: "Viande / poisson",
  "steak hache": "Viande / poisson",
  "steak haché": "Viande / poisson",

  oeuf: "Frais",
  œuf: "Frais",
  fromage: "Frais",
  "fromage rape": "Frais",
  "fromage râpé": "Frais",
  cheddar: "Frais",
  parmesan: "Frais",
  creme: "Frais",
  crème: "Frais",
  beurre: "Frais",
  "lait coco": "Frais",

  riz: "Féculents",
  pate: "Féculents",
  pâtes: "Féculents",
  semoule: "Féculents",
  tortilla: "Féculents",
  "pain de mie": "Féculents",
  "pain burger": "Féculents",
  "pate brisee": "Féculents",
  "pâte brisée": "Féculents",

  "sauce tomate": "Épicerie",
  "tomates concassees": "Épicerie",
  "tomates concassées": "Épicerie",
  "haricot rouge": "Épicerie",
  mais: "Épicerie",
  maïs: "Épicerie",
  "pois chiche": "Épicerie",
  curry: "Épicerie",
  "sauce soja": "Épicerie",
  mayonnaise: "Épicerie",
  pesto: "Épicerie",
  salsa: "Épicerie",
  "sauce salsa": "Épicerie",
  "sauce blanche": "Épicerie",
};

const CATEGORY_ORDER = [
  "Fruits / légumes",
  "Viande / poisson",
  "Frais",
  "Féculents",
  "Épicerie",
  "Autre",
];

function getShoppingCategory(item: ShoppingListItem): string {
  return INGREDIENT_CATEGORIES[item.canonicalName] ?? "Autre";
}

export function groupShoppingListByCategory(
  items: ShoppingListItem[],
): ShoppingCategory[] {
  const groupedCategories = new Map<string, ShoppingListItem[]>();

  for (const item of items) {
    const categoryName = getShoppingCategory(item);

    if (!groupedCategories.has(categoryName)) {
      groupedCategories.set(categoryName, []);
    }

    groupedCategories.get(categoryName)?.push(item);
  }

  return CATEGORY_ORDER.map((categoryName) => ({
    name: categoryName,
    items: groupedCategories.get(categoryName) ?? [],
  })).filter((category) => category.items.length > 0);
}
export function formatShoppingListForText(
  categories: ShoppingCategory[],
): string {
  return categories
    .map((category) => {
      const lines = category.items.map(
        (item) => `- ${formatShoppingListItem(item)}`,
      );

      return `${category.name}\n${lines.join("\n")}`;
    })
    .join("\n\n");
}
