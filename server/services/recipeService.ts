import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { recipes } from '../db/schema';

export type Recipe = {
  id: number;
  name: string;
  prepTime: string | null;
  cookTime: string | null;
  totalTime: string | null;
  servings: string | null;
  cuisine: string | null;
};

class RecipeService {
  async getAllRecipes(): Promise<Recipe[]> {
    const db = await getDb();

    // Use Drizzle's query API to get recipes with all related data
    const recipesWithData = await db.query.recipes.findMany({
      where: (recipes, { isNull }) => isNull(recipes.deletedAt),
      orderBy: (recipes, { desc }) => [desc(recipes.createdAt)],
    });

    // Transform the data to match RecipeData interface
    return recipesWithData.map((recipe) => ({
      id: recipe.id,
      name: recipe.name,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      totalTime: recipe.totalTime,
      servings: recipe.servings,
      cuisine: recipe.cuisine,
    }));
  }

  async getRecipeById(id: number) {
    const db = await getDb();

    // Use Drizzle's query API to get a single recipe with all related data
    const recipe = await db.query.recipes.findFirst({
      where: (recipes, { eq, isNull, and }) =>
        and(eq(recipes.id, id), isNull(recipes.deletedAt)),
      with: {
        ingredientGroups: {
          with: {
            ingredients: true,
          },
          orderBy: (groups, { asc }) => [asc(groups.sortOrder)],
        },
        instructions: {
          orderBy: (instructions, { asc }) => [asc(instructions.stepNumber)],
        },
        notes: {
          orderBy: (notes, { asc }) => [asc(notes.sortOrder)],
        },
      },
    });

    if (!recipe) {
      return null;
    }

    // Transform the data to match RecipeData interface
    return {
      id: recipe.id,
      name: recipe.name,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      totalTime: recipe.totalTime,
      servings: recipe.servings,
      cuisine: recipe.cuisine,
      ingredients: recipe.ingredientGroups.map((group) => ({
        name: group.name,
        items: group.ingredients
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((ingredient) => ingredient.ingredient),
      })),
      instructions: recipe.instructions.map(
        (instruction) => instruction.instruction
      ),
      notes: recipe.notes.map((note) => note.note),
      sourceUrl: recipe.sourceUrl,
    };
  }

  async softDeleteRecipe(id: number): Promise<boolean> {
    const db = await getDb();

    // Update the recipe's deletedAt timestamp
    const result = await db
      .update(recipes)
      .set({ deletedAt: new Date() })
      .where(eq(recipes.id, id))
      .returning();

    return result.length > 0;
  }
}

export const recipeService = new RecipeService();
