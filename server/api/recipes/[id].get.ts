import z from 'zod';
import { recipeService } from '../../services/recipeService';

const paramInput = z.object({
  id: z.string().transform((val, ctx) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ID must be a positive integer',
      });
      return z.NEVER;
    }
    return parsed;
  }),
});

export default defineEventHandler(async (event) => {
  const parsedParams = paramInput.safeParse({
    id: getRouterParam(event, 'id'),
  });

  if (!parsedParams.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        parsedParams.error.issues[0]?.message || 'Invalid recipe ID',
    });
  }

  const { id } = parsedParams.data;
  const recipe = await recipeService.getRecipeById(id);

  if (!recipe) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Recipe not found',
    });
  }

  return recipe;
});

defineRouteMeta({
  openAPI: {
    tags: ['Recipes'],
    summary: 'Get recipe by ID',
    description:
      'Retrieves a single recipe by its ID with ingredients, instructions, and notes',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'integer',
          minimum: 1,
        },
        description: 'The ID of the recipe to retrieve',
      },
    ],
  },
});
