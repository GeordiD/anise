import { generateObject } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { recipeSchema, type RecipeData } from '../schemas/recipeSchema';

export interface UsageStats {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

export interface RecipeExtractionResult {
  recipe: RecipeData;
  usage: UsageStats;
}

export class LLMService {
  private anthropic: ReturnType<typeof createAnthropic>;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    this.anthropic = createAnthropic({
      apiKey,
    });
  }

  async extractRecipe(
    content: string,
    maxRetries: number = 3
  ): Promise<RecipeExtractionResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.attemptRecipeExtraction(content, attempt);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempt === maxRetries) {
          break;
        }

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
        );
      }
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to extract recipe after ${maxRetries} attempts: ${
        lastError?.message || 'Unknown error'
      }`,
    });
  }

  private async attemptRecipeExtraction(
    content: string,
    attempt: number
  ): Promise<RecipeExtractionResult> {
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

    const result = await generateObject({
      model: this.anthropic('claude-sonnet-4-20250514'),
      schema: recipeSchema,
      prompt,
      temperature: attempt > 1 ? 0.2 : 0.1,
    });

    // Calculate usage and costs
    const usage = this.calculateUsage(result.usage);

    return {
      recipe: result.object,
      usage,
    };
  }

  private calculateUsage(usage: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  }): UsageStats {
    const inputTokens = usage?.promptTokens ?? 0;
    const outputTokens = usage?.completionTokens ?? 0;
    const totalTokens = usage?.totalTokens ?? 0;

    // Claude 3.5 Sonnet pricing: $3/M input, $15/M output
    const inputCost = (inputTokens / 1000000) * 3;
    const outputCost = (outputTokens / 1000000) * 15;
    const totalCost = inputCost + outputCost;

    return {
      inputTokens,
      outputTokens,
      totalTokens,
      inputCost: Number(inputCost.toFixed(6)),
      outputCost: Number(outputCost.toFixed(6)),
      totalCost: Number(totalCost.toFixed(6)),
    };
  }
}

export const llmService = new LLMService();
