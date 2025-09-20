import { recipeService, type Recipe } from '../../services/recipeService';

export type RecipesResponse = {
  success: boolean;
  recipes: Recipe[];
};

export default defineEventHandler(async () => {
  const recipes = await recipeService.getAllRecipes();

  return {
    success: true,
    recipes,
  };
});

defineRouteMeta({
  openAPI: {
    tags: ['Recipes'],
    summary: 'Get all recipes',
    description:
      'Retrieves all recipes with their ingredients, instructions, and notes',
  },
});
