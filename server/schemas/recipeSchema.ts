import { z } from 'zod';

// Zod schema for recipe data with comprehensive validation
export const recipeSchema = z.object({
  name: z.string()
    .min(1, 'Recipe name is required')
    .max(200, 'Recipe name too long')
    .describe('The name of the recipe'),
  
  description: z.string()
    .max(500, 'Description too long')
    .optional()
    .describe('Brief description of the recipe'),
  
  prepTime: z.string()
    .max(50, 'Prep time too long')
    .optional()
    .describe('Preparation time (e.g., "15 minutes", "1 hour")'),
  
  cookTime: z.string()
    .max(50, 'Cook time too long')
    .optional()
    .describe('Cooking time (e.g., "30 minutes", "2 hours")'),
  
  totalTime: z.string()
    .max(50, 'Total time too long')
    .optional()
    .describe('Total time from start to finish'),
  
  servings: z.string()
    .max(50, 'Servings too long')
    .optional()
    .describe('Number of servings (e.g., "4 people", "6-8 servings")'),
  
  difficulty: z.enum(['easy', 'medium', 'hard'])
    .optional()
    .describe('Difficulty level of the recipe'),
  
  cuisine: z.string()
    .max(100, 'Cuisine too long')
    .optional()
    .describe('Type of cuisine (e.g., "Italian", "Chinese", "American")'),
  
  ingredients: z.array(
    z.string()
      .min(1, 'Ingredient cannot be empty')
      .max(200, 'Ingredient description too long')
      .describe('Individual ingredient with quantity and description')
  )
    .min(1, 'At least one ingredient is required')
    .max(50, 'Too many ingredients')
    .describe('List of all ingredients needed for the recipe'),
  
  instructions: z.array(
    z.string()
      .min(1, 'Instruction cannot be empty')
      .max(500, 'Instruction too long')
      .describe('Individual step in the cooking process')
  )
    .min(1, 'At least one instruction is required')
    .max(30, 'Too many instructions')
    .describe('Step-by-step cooking instructions'),
  
  notes: z.string()
    .max(1000, 'Notes too long')
    .optional()
    .describe('Additional notes, tips, or variations for the recipe'),
  
  nutrition: z.object({
    calories: z.number().positive().optional(),
    protein: z.string().optional(),
    carbs: z.string().optional(),
    fat: z.string().optional(),
    fiber: z.string().optional()
  }).optional().describe('Nutritional information if available'),
  
  tags: z.array(z.string().max(50))
    .max(20, 'Too many tags')
    .optional()
    .describe('Recipe tags like "vegetarian", "gluten-free", "quick", etc.')
});

// TypeScript type inferred from Zod schema
export type RecipeData = z.infer<typeof recipeSchema>;

// Manual JSON Schema for OpenRouter tool calling (more reliable than zod-to-json-schema)
export const recipeJsonSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'The name of the recipe'
    },
    description: {
      type: 'string',
      description: 'Brief description of the recipe'
    },
    prepTime: {
      type: 'string',
      description: 'Preparation time (e.g., "15 minutes", "1 hour")'
    },
    cookTime: {
      type: 'string',
      description: 'Cooking time (e.g., "30 minutes", "2 hours")'
    },
    totalTime: {
      type: 'string',
      description: 'Total time from start to finish'
    },
    servings: {
      type: 'string',
      description: 'Number of servings (e.g., "4 people", "6-8 servings")'
    },
    difficulty: {
      type: 'string',
      enum: ['easy', 'medium', 'hard'],
      description: 'Difficulty level of the recipe'
    },
    cuisine: {
      type: 'string',
      description: 'Type of cuisine (e.g., "Italian", "Chinese", "American")'
    },
    ingredients: {
      type: 'array',
      items: {
        type: 'string',
        description: 'Individual ingredient with quantity and description'
      },
      description: 'List of all ingredients needed for the recipe'
    },
    instructions: {
      type: 'array',
      items: {
        type: 'string',
        description: 'Individual step in the cooking process'
      },
      description: 'Step-by-step cooking instructions'
    },
    notes: {
      type: 'string',
      description: 'Additional notes, tips, or variations for the recipe'
    },
    nutrition: {
      type: 'object',
      properties: {
        calories: { type: 'number' },
        protein: { type: 'string' },
        carbs: { type: 'string' },
        fat: { type: 'string' },
        fiber: { type: 'string' }
      },
      description: 'Nutritional information if available'
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      description: 'Recipe tags like "vegetarian", "gluten-free", "quick", etc.'
    }
  },
  required: ['name', 'ingredients', 'instructions'],
  additionalProperties: false
};

// Tool definition for OpenRouter
export const extractRecipeTool = {
  type: 'function' as const,
  function: {
    name: 'extract_recipe',
    description: 'Extract structured recipe information from the provided content',
    parameters: recipeJsonSchema
  }
};