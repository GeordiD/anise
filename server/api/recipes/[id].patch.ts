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

const bodyInput = z.object({
  name: z.string().min(1),
});

export type PatchRecipeResponse = {
  success: boolean;
  message: string;
};

export default defineEventHandler(
  async (event): Promise<PatchRecipeResponse> => {
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

    const body = await readBody(event);
    const parsedBody = bodyInput.safeParse(body);

    if (!parsedBody.success) {
      throw createError({
        statusCode: 400,
        statusMessage:
          parsedBody.error.issues[0]?.message || 'Invalid request body',
      });
    }

    const updated = await recipeService.updateRecipeName(
      id,
      parsedBody.data.name
    );

    if (!updated) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Recipe not found',
      });
    }

    return {
      success: true,
      message: 'Recipe updated successfully',
    };
  }
);

defineRouteMeta({
  openAPI: {
    tags: ['Recipes'],
    summary: 'Update recipe',
    description: 'Updates a recipe name',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'integer',
          minimum: 1,
        },
        description: 'The ID of the recipe to update',
      },
    ],
  },
});
