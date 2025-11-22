import { generateObject } from 'ai';
import type { RecipeData } from '~~/server/schemas/recipeSchema';
import { recipeSchema } from '~~/server/schemas/recipeSchema';
import { llmService } from '~~/server/services/llmService';
import type { UsageStats } from '~~/server/utils/UsageStats';

export async function extractRecipe(content: string): Promise<{
  recipe: RecipeData;
  usage: UsageStats;
}> {
  const prompt = `Extract recipe information from the provided content.

Guidelines:
- Extract ingredients as individual items, preserving quantities and descriptions
- Extract instructions as numbered steps in order
- Include timing information if present
- Be precise and don't add information not in the content
- If information is not available, omit that field
- For difficulty, choose from: easy, medium, hard (or omit if unclear)

Content:
<content>
${content}
</content>`;

  try {
    const result = await generateObject({
      model: llmService.anthropic('claude-sonnet-4-20250514'),
      schema: recipeSchema,
      prompt,
      temperature: 0.1,
      maxRetries: 3,
    });

    return {
      recipe: result.object,
      usage: llmService.calculateUsage(result),
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to extract recipe: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    });
  }
}
