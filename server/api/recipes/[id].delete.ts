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

export type DeleteRecipeResponse = {
  success: boolean;
  message: string;
};

export default defineEventHandler(
  async (event): Promise<DeleteRecipeResponse> => {
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
    const deleted = await recipeService.softDeleteRecipe(id);

    if (!deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Recipe not found',
      });
    }

    return {
      success: true,
      message: 'Recipe deleted successfully',
    };
  }
);

defineRouteMeta({
  openAPI: {
    tags: ['Recipes'],
    summary: 'Delete recipe by ID',
    description: 'Deletes a recipe',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'integer',
          minimum: 1,
        },
        description: 'The ID of the recipe to delete',
      },
    ],
  },
});
