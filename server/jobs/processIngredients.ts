import pLimit from 'p-limit';
import { llmStep } from '~~/server/jobs/helpers/llmStep';
import { step } from '~~/server/jobs/helpers/step';
import type { ParsedIngredient } from '~~/server/schemas/ingredientSchema';
import type { RecipeData } from '~~/server/schemas/recipeSchema';
import { ingredientService } from '~~/server/services/ingredientService';
import { matchIngredient } from '~~/server/services/prompts/matchIngredient';
import { parseIngredient } from '~~/server/services/prompts/parseIngredient';

type MappedIngredient = {
  ingredient: string;
  ingredientId: number;
} & ParsedIngredient;

export async function processIngredients({
  ingredients: ingredientGroups,
}: Pick<RecipeData, 'ingredients'>) {
  const limit = pLimit(5);
  const ingredientNames = ingredientGroups.flatMap(({ items }) => items);

  const tasks = ingredientNames.map((name) =>
    limit(() => step('process-ingredient', processIngredient, name))
  );

  return await Promise.all(tasks);
}

export async function processIngredient(
  rawName: string
): Promise<MappedIngredient> {
  // Break it down into pieces
  const { parsed } = await llmStep(
    'llm-parse-ingredient',
    parseIngredient,
    rawName
  );

  // Match by name
  const matchedIngredient = await matchIngredientName(parsed.name);

  return {
    ingredient: rawName,
    ingredientId: matchedIngredient.id,
    name: matchedIngredient.name,
    note: parsed.note,
    quantity: parsed.quantity,
    unit: parsed.unit,
  };
}

async function matchIngredientName(inputName: string): Promise<{
  id: number;
  name: string;
}> {
  // Start by checking if there's an exact match
  const exactMatch = await step(
    'match-ingredient-via-exact',
    ingredientService.findIngredientByName,
    inputName
  );
  if (exactMatch) {
    return exactMatch;
  }

  // Otherwise use LLM to find similar
  const candidates = await ingredientService.findSimilarIngredients(inputName);
  const { match } = await llmStep('match-ingredient-via-llm', matchIngredient, {
    parsedName: inputName,
    candidates,
  });

  if (match.matchedId !== null) {
    // Found a match - return the existing ingredient
    const existingIngredient = await ingredientService.findIngredientByName(
      match.standardizedName
    );

    if (!existingIngredient) {
      throw createError({
        statusCode: 500,
        statusMessage: `Matched ingredient ID ${match.matchedId} not found in database`,
      });
    }

    return existingIngredient;
  } else {
    // No match - create new standardized ingredient
    const createdIngredient = await ingredientService.createIngredient(
      match.standardizedName
    );

    if (!createdIngredient) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create new ingredient',
      });
    }

    return createdIngredient;
  }
}
