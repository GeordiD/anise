import { generateObject } from 'ai';
import type { IngredientMatch } from '~~/server/schemas/ingredientSchema';
import { ingredientMatchSchema } from '~~/server/schemas/ingredientSchema';
import type { UsageStats } from '~~/server/services/llmService';
import { llmService } from '~~/server/services/llmService';

/**
 * System prompt for ingredient matching - this will be cached by Anthropic
 */
const MATCHING_SYSTEM_PROMPT = `You are an expert at matching and standardizing recipe ingredient names.

Your task is to determine if a parsed ingredient name matches any existing standardized ingredients in the database, or if a new standardized ingredient should be created.

Guidelines for matching:
1. **Exact matches**: If the name exactly matches an existing ingredient, return that ID with high confidence
2. **Synonym matches**: Recognize common synonyms (e.g., "scallion" = "green onion", "cilantro" = "coriander leaves")
3. **Plural/singular**: Match regardless of plural/singular form (e.g., "tomato" = "tomatoes")
4. **Specificity**: More specific ingredients should not match less specific ones (e.g., "green bell pepper" should not match "bell pepper" if "green bell pepper" exists)
5. **Color/variety modifiers**: Treat color/variety as significant (e.g., "red onion" ≠ "yellow onion")
6. **No match**: If no good match exists, return null for matchedId and suggest a new standardized name

Confidence levels:
- **high**: Exact match or well-known synonym
- **medium**: Likely match but slight uncertainty (e.g., "garlic" could match "garlic clove")
- **low**: Uncertain match, might need human review

When suggesting a new standardized name (matchedId = null):
- Use singular form
- Use common/familiar terminology
- Be consistent with existing naming patterns
- Include important modifiers (e.g., "green bell pepper" not just "pepper")`;

interface CandidateIngredient {
  id: number;
  name: string;
}

/**
 * Match a parsed ingredient name against existing standardized ingredients
 * Uses Anthropic's prompt caching to reduce costs when processing multiple ingredients
 */
export async function matchIngredient(
  parsedName: string,
  candidates: CandidateIngredient[]
): Promise<{
  match: IngredientMatch;
  usage: UsageStats;
}> {
  const candidatesText =
    candidates.length > 0
      ? candidates.map((c) => `- ID ${c.id}: "${c.name}"`).join('\n')
      : 'No existing ingredients in database yet.';

  const prompt = `Match the following ingredient name to an existing standardized ingredient, or suggest a new standardized name if no good match exists.

Ingredient to match: "${parsedName}"

Existing standardized ingredients:
${candidatesText}

Determine:
1. If there's a match, provide the matchedId and confidence level
2. If no match, set matchedId to null and suggest a standardized name
3. The standardizedName should be the name to use (either from the matched ingredient or a new suggestion)`;

  try {
    const result = await generateObject({
      model: llmService.anthropic('claude-sonnet-4-20250514'),
      schema: ingredientMatchSchema,
      system: MATCHING_SYSTEM_PROMPT,
      prompt,
      temperature: 0.1,
      maxRetries: 2,
      // TODO: Add Anthropic prompt caching when AI SDK supports it
    });

    return {
      match: result.object,
      usage: llmService.calculateUsage(result.usage),
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to match ingredient "${parsedName}": ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    });
  }
}
