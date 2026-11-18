import { reader } from './cms';

type RawRecipe = NonNullable<Awaited<ReturnType<typeof reader.collections.recipes.read>>>;

export type Recipe = RawRecipe;
export type RecipeSummary = Pick<
  Recipe,
  'title' | 'description' | 'publishedAt' | 'servings' | 'prepTime' | 'cookTime'
> & { slug: string };

export async function getRecipes(): Promise<RecipeSummary[]> {
  const entries = await reader.collections.recipes.all();

  return entries
    .filter(({ entry }) => !entry.draft)
    .map(({ slug, entry }) => ({
      slug,
      title: entry.title,
      description: entry.description,
      publishedAt: entry.publishedAt,
      servings: entry.servings,
      prepTime: entry.prepTime,
      cookTime: entry.cookTime,
    }))
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
}

export async function getRecipe(slug: string): Promise<Recipe | null> {
  const recipe = await reader.collections.recipes.read(slug);

  if (!recipe || recipe.draft) {
    return null;
  }

  return recipe;
}
