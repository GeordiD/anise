import type { MappedIngredientGroup } from '~~/server/jobs/add-recipe/processIngredients';
import { processIngredients } from '~~/server/jobs/add-recipe/processIngredients';
import { saveRecipe } from '~~/server/jobs/add-recipe/saveRecipe';
import { scrapeAndCleanContent } from '~~/server/jobs/add-recipe/scrapeAndCleanContent';
import { job } from '~~/server/jobs/helpers/job';
import { llmStep } from '~~/server/jobs/helpers/llmStep';
import { step } from '~~/server/jobs/helpers/step';
import type { RecipeData } from '~~/server/schemas/recipeSchema';
import { extractRecipe } from '~~/server/services/prompts/extractRecipe';

export interface RecipeDataWithMappedIngredients
  extends Omit<RecipeData, 'ingredients'> {
  ingredients: MappedIngredientGroup[];
}

export async function addRecipeByUrl(url: string): Promise<{ id: number }> {
  const result = await job('add-recipe', async () => {
    const cleanedContent = await step(
      'scrape-data',
      scrapeAndCleanContent,
      url
    );

    const { recipe } = await llmStep(
      'extract-recipe',
      extractRecipe,
      cleanedContent
    );

    const mappedIngredientGroups = await processIngredients(recipe);

    const { ingredients: _, ...restOfRecipe } = recipe;

    const mappedRecipe: RecipeDataWithMappedIngredients = {
      ...restOfRecipe,
      ingredients: mappedIngredientGroups,
    };

    return await saveRecipe(mappedRecipe, url);
  });

  return result.result;
}
