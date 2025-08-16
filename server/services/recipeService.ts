import { getDb } from '../db';

class RecipeService {
  async getAllRecipes() {
    const db = await getDb();

    // Use Drizzle's query API to get recipes with all related data
    const recipesWithData = await db.query.recipes.findMany({
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
      where: (recipes, { eq }) => eq(recipes.id, id),
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
    };
  }
}

export const recipeService = new RecipeService();
