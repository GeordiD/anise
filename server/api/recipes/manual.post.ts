import { z } from 'zod';
import { job } from '~~/server/jobs/helpers/job';
import type { RecipeDataWithMappedIngredients } from '~~/server/jobs/add-recipe';
import { processIngredients } from '~~/server/jobs/add-recipe/processIngredients';
import { saveRecipe } from '~~/server/jobs/add-recipe/saveRecipe';

const bodySchema = z.object({
  name: z.string().min(1, 'Recipe name is required'),
  ingredients: z.array(z.string().min(1)).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string().min(1)),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  servings: z.string().optional(),
});

const FALLBACK_INSTRUCTION = 'Cook it!';

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse);

  const instructions =
    body.instructions.length > 0 ? body.instructions : [FALLBACK_INSTRUCTION];

  const { result } = await job('add-recipe-manual', async () => {
    const mappedIngredientGroups = await processIngredients({
      ingredients: [{ items: body.ingredients }],
    });

    const mappedRecipe: RecipeDataWithMappedIngredients = {
      name: body.name,
      ingredients: mappedIngredientGroups,
      instructions,
      prepTime: body.prepTime,
      cookTime: body.cookTime,
      servings: body.servings,
    };

    return await saveRecipe(mappedRecipe, '');
  });

  return result;
});
