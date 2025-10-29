import { eq } from 'drizzle-orm';
import z from 'zod';
import { getDb } from '../../../db';
import { recipeIngredientSubstitutions } from '../../../db/schema';

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
  ingredient: z.string().min(1, 'Ingredient text is required'),
});

export type SaveSubstitutionResponse = {
  success: boolean;
  message: string;
};

export default defineEventHandler(
  async (event): Promise<SaveSubstitutionResponse> => {
    // Validate route parameter
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

    // Validate request body
    const body = await readBody(event);
    const parsedBody = bodyInput.safeParse(body);

    if (!parsedBody.success) {
      throw createError({
        statusCode: 400,
        statusMessage:
          parsedBody.error.issues[0]?.message || 'Invalid request body',
      });
    }

    const { ingredient } = parsedBody.data;

    // Get database connection
    const db = await getDb();

    // Check if ingredient exists
    const existingIngredient = await db.query.recipeIngredients.findFirst({
      where: (ingredients, { eq }) => eq(ingredients.id, id),
    });

    if (!existingIngredient) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Ingredient not found',
      });
    }

    // Delete existing substitutions for this ingredient
    await db
      .delete(recipeIngredientSubstitutions)
      .where(eq(recipeIngredientSubstitutions.ingredientId, id));

    // Insert new substitution
    await db.insert(recipeIngredientSubstitutions).values({
      ingredientId: id,
      ingredient,
    });

    return {
      success: true,
      message: 'Substitution saved successfully',
    };
  }
);

defineRouteMeta({
  openAPI: {
    tags: ['Ingredients'],
    summary: 'Save ingredient substitution',
    description:
      'Saves a substitution for an ingredient. Replaces any existing substitution.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'integer',
          minimum: 1,
        },
        description: 'The ID of the ingredient to add a substitution for',
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
                description: 'The substitution ingredient text',
                example: '2 cups almond milk',
              },
            },
            required: ['ingredient'],
          },
        },
      },
    },
  },
});
