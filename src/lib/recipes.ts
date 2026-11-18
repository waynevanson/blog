import type { Node } from '@markdoc/markdoc';
import { reader } from './cms';

export { renderMarkdoc } from './posts';

type RawRecipe = NonNullable<Awaited<ReturnType<typeof reader.collections.recipes.read>>>;

// `content` is only a function until the entry is read with
// `resolveLinkedFiles: true`, at which point it becomes the parsed Markdoc node.
export type Recipe = Omit<RawRecipe, 'content'> & { content: { node: Node } };
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
  const recipe = (await reader.collections.recipes.read(slug, {
    resolveLinkedFiles: true,
  })) as Recipe | null;

  if (!recipe || recipe.draft) {
    return null;
  }

  return recipe;
}
