import { z } from 'zod';

// Zod schema for recipe data with comprehensive validation
export const recipeSchema = z.object({
  name: z
    .string()
    .min(1, 'Recipe name is required')
    .max(200, 'Recipe name too long')
    .describe(
      'The name of the recipe. Keep this as generic as possible while still being descriptive.'
    ),

  prepTime: z
    .string()
    .max(50, 'Prep time too long')
    .optional()
    .describe(
      'Preparation time listed in the recipe (e.g., "15 minutes", "1 hour")'
    ),

  cookTime: z
    .string()
    .max(50, 'Cook time too long')
    .optional()
    .describe(
      'Cooking time listed in the recipe (e.g., "30 minutes", "2 hours")'
    ),

  totalTime: z
    .string()
    .max(50, 'Total time too long')
    .optional()
    .describe(
      'Total time from start to finish (listed in the recipe -- do not calculate this yourself)'
    ),

  servings: z
    .string()
    .max(50, 'Servings too long')
    .optional()
    .describe('Number of servings (e.g., "4 people", "6-8 servings")'),

  cuisine: z
    .string()
    .max(100, 'Cuisine too long')
    .optional()
    .describe('Type of cuisine (e.g., "Italian", "Chinese", "American")'),

  ingredients: z
    .array(
      z
        .string()
        .min(1, 'Ingredient cannot be empty')
        .max(200, 'Ingredient description too long')
        .describe('Individual ingredient with quantity and description')
    )
    .min(1, 'At least one ingredient is required')
    .max(50, 'Too many ingredients')
    .describe(
      'List of all ingredients needed for the recipe. This should match the recipe exactly'
    ),

  instructions: z
    .array(
      z
        .string()
        .min(1, 'Instruction cannot be empty')
        .max(500, 'Instruction too long')
        .describe('Individual step in the cooking process')
    )
    .min(1, 'At least one instruction is required')
    .max(30, 'Too many instructions')
    .describe('Step-by-step cooking instructions'),

  notes: z
    .array(
      z
        .string()
        .min(1, 'Note cannot be empty')
        .max(200, 'Note too long')
        .describe('Individual important note, tip, or variation')
    )
    .max(6, 'Too many notes - only include the most important ones')
    .optional()
    .describe(
      'Only the most important notes, tips, or variations. If not critically important, omit entirely.'
    ),
});

// TypeScript type inferred from Zod schema
export type RecipeData = z.infer<typeof recipeSchema>;

// Manual JSON Schema for OpenRouter tool calling (more reliable than zod-to-json-schema)
export const recipeJsonSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'The name of the recipe',
    },
    description: {
      type: 'string',
      description: 'Brief description of the recipe',
    },
    prepTime: {
      type: 'string',
      description: 'Preparation time (e.g., "15 minutes", "1 hour")',
    },
    cookTime: {
      type: 'string',
      description: 'Cooking time (e.g., "30 minutes", "2 hours")',
    },
    totalTime: {
      type: 'string',
      description: 'Total time from start to finish',
    },
    servings: {
      type: 'string',
      description: 'Number of servings (e.g., "4 people", "6-8 servings")',
    },
    difficulty: {
      type: 'string',
      enum: ['easy', 'medium', 'hard'],
      description: 'Difficulty level of the recipe',
    },
    cuisine: {
      type: 'string',
      description: 'Type of cuisine (e.g., "Italian", "Chinese", "American")',
    },
    ingredients: {
      type: 'array',
      items: {
        type: 'string',
        description: 'Individual ingredient with quantity and description',
      },
      description: 'List of all ingredients needed for the recipe',
    },
    instructions: {
      type: 'array',
      items: {
        type: 'string',
        description: 'Individual step in the cooking process',
      },
      description: 'Step-by-step cooking instructions',
    },
    notes: {
      type: 'array',
      items: {
        type: 'string',
        description: 'Individual important note, tip, or variation',
      },
      maxItems: 6,
      description:
        'Only the most important notes, tips, or variations. If not critically important, omit entirely.',
    },
    nutrition: {
      type: 'object',
      properties: {
        calories: { type: 'number' },
        protein: { type: 'string' },
        carbs: { type: 'string' },
        fat: { type: 'string' },
        fiber: { type: 'string' },
      },
      description: 'Nutritional information if available',
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Recipe tags like "vegetarian", "gluten-free", "quick", etc.',
    },
  },
  required: ['name', 'ingredients', 'instructions'],
  additionalProperties: false,
};

// Tool definition for OpenRouter
export const extractRecipeTool = {
  type: 'function' as const,
  function: {
    name: 'extract_recipe',
    description:
      'Extract structured recipe information from the provided content',
    parameters: recipeJsonSchema,
  },
};
