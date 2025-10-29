import { eq } from 'drizzle-orm';
import z from 'zod';
import { getDb } from '../../db';
import { recipeIngredients } from '../../db/schema';

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
  ingredient: z.string().min(1).optional(),
  doNotUse: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type UpdateIngredientResponse = {
  success: boolean;
  message: string;
};

export default defineEventHandler(
  async (event): Promise<UpdateIngredientResponse> => {
    const parsedParams = paramInput.safeParse({
      id: getRouterParam(event, 'id'),
    });

    if (!parsedParams.success) {
      throw createError({
        statusCode: 400,
        statusMessage:
          parsedParams.error.issues[0]?.message || 'Invalid ingredient ID',
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

    const updates = parsedBody.data;

    // Check if at least one field is being updated
    if (Object.keys(updates).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'At least one field must be provided for update',
      });
    }

    const db = await getDb();

    const existingIngredient = await db.query.recipeIngredients.findFirst({
      where: (ingredients, { eq }) => eq(ingredients.id, id),
    });

    if (!existingIngredient) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Ingredient not found',
      });
    }

    // Update the ingredient with provided fields
    await db
      .update(recipeIngredients)
      .set(updates)
      .where(eq(recipeIngredients.id, id));

    return {
      success: true,
      message: 'Ingredient updated successfully',
    };
  }
);

defineRouteMeta({
  openAPI: {
    tags: ['Ingredients'],
    summary: 'Update ingredient',
    description:
      'Updates an ingredient with the provided fields. Only the fields provided in the request body will be updated.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'integer',
          minimum: 1,
        },
        description: 'The ID of the ingredient to update',
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              ingredient: {
                type: 'string',
                description: 'The ingredient text',
                example: '2 cups milk',
              },
              doNotUse: {
                type: 'boolean',
                description: 'Whether to mark the ingredient as do not use',
                example: true,
              },
              sortOrder: {
                type: 'integer',
                minimum: 0,
                description: 'The sort order for the ingredient',
                example: 0,
              },
            },
          },
        },
      },
    },
  },
});
