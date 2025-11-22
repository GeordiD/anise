import { generateObject } from 'ai';
import type { ParsedIngredient } from '~~/server/schemas/ingredientSchema';
import { parsedIngredientSchema } from '~~/server/schemas/ingredientSchema';
import { llmService } from '~~/server/services/llmService';
import type { UsageStats } from '~~/server/utils/UsageStats';

/**
 * System prompt for ingredient parsing
 * This is marked with Anthropic's cache control to reduce costs when parsing multiple ingredients.
 * First call creates the cache, subsequent calls read from cache at 90% cost reduction.
 */
const PARSING_SYSTEM_PROMPT = `You are an expert at parsing recipe ingredient text into structured components.

Your task is to extract:
1. **quantity**: The numeric amount (e.g., "2", "1/2", "2-3", "a pinch")
   - Use null if not specified or for "to taste"
   - Keep fractions as text (e.g., "1/2", "1 1/2")
   - Keep ranges as text (e.g., "2-3", "1-2")

2. **unit**: The unit of measurement (e.g., "cups", "tbsp", "tsp", "oz", "grams", "lbs")
   - Use null if not specified or for count-based items (e.g., "2 eggs")
   - Normalize abbreviations: "tbsp" not "T", "tsp" not "t", etc.
   - Should always be singular (e.g., "cup" not "cups")

3. **name**: The ingredient name in singular form
   - Use singular form (e.g., "green bell pepper" not "green bell peppers")
   - Keep descriptive modifiers that are part of the ingredient identity (e.g., "green bell pepper", "mandarin orange", "chicken breast")
   - Remove preparation details; those go in notes. (e.g., "minced", "freshly cracked")
   - Standardize common variations (e.g., "olive oil" not "extra virgin olive oil")

4. **note**: Preparation details, modifiers, or optional markers
   - Include preparation methods (e.g., "diced", "minced", "chopped")
   - Include state descriptors (e.g., "room temperature", "melted", "softened")
   - Include optional markers (e.g., "optional", "if desired")
   - Use null if there are no additional notes.

Examples:
- "2 cups green bell peppers, diced" → {quantity: "2", unit: "cup", name: "green bell pepper", note: "diced"}
- "1/2 tsp salt" → {quantity: "1/2", unit: "tsp", name: "salt", note: null}
- "3 oranges" → {quantity: "3", unit: null, name: "orange", note: null}
- "3 garlic cloves, minced" → {quantity: "3", unit: "clove", name: "garlic", note: "minced"}
- "Salt and pepper to taste" → {quantity: null, unit: null, name: "salt and pepper", note: "to taste"}
- "1 lb ground beef (optional)" → {quantity: "1", unit: "lb", name: "ground beef", note: "optional"}`;

/**
 * Parse a raw ingredient string into structured components using AI
 * Uses Anthropic's prompt caching to reduce costs when processing multiple ingredients
 */
export async function parseIngredient(rawIngredient: string): Promise<{
  parsed: ParsedIngredient;
  usage: UsageStats;
}> {
  try {
    const result = await generateObject({
      model: llmService.anthropic('claude-sonnet-4-20250514'),
      schema: parsedIngredientSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: PARSING_SYSTEM_PROMPT,
              providerOptions: {
                anthropic: { cacheControl: { type: 'ephemeral' } },
              },
            },
            {
              type: 'text',
              text: `Parse the following ingredient:\n\n${rawIngredient}`,
            },
          ],
        },
      ],
      temperature: 0.1,
      maxRetries: 2,
    });

    const cacheCreation = result.providerMetadata?.anthropic?.cacheCreationInputTokens;
    const cacheRead = result.usage.cachedInputTokens;

    return {
      parsed: result.object,
      usage: llmService.calculateUsage({
        ...result.usage,
        // AI SDK provides cache creation tokens in provider metadata
        cacheCreationInputTokens: typeof cacheCreation === 'number' ? cacheCreation : 0,
        // AI SDK normalizes cache read tokens as 'cachedInputTokens' in the usage object
        cacheReadInputTokens: typeof cacheRead === 'number' ? cacheRead : 0,
      }),
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to parse ingredient "${rawIngredient}": ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    });
  }
}
