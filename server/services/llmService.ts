import { createAnthropic } from '@ai-sdk/anthropic';
import type { GenerateObjectResult } from 'ai';
import type { UsageStats } from '~~/server/utils/UsageStats';
import type { RecipeData } from '../schemas/recipeSchema';

export interface RecipeExtractionResult {
  recipe: RecipeData;
  usage: UsageStats;
}

export class LLMService {
  anthropic: ReturnType<typeof createAnthropic>;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    this.anthropic = createAnthropic({
      apiKey,
    });
  }

  /**
   * Calculate usage statistics from AI SDK generateObject result
   * Automatically extracts cache tokens from Anthropic provider metadata
   */
  calculateUsage(result: GenerateObjectResult<unknown>): UsageStats {
    const inputTokens = result.usage.inputTokens ?? 0;
    const outputTokens = result.usage.outputTokens ?? 0;
    const totalTokens = result.usage.totalTokens ?? 0;
    const cacheReadInputTokens = result.usage.cachedInputTokens ?? 0;

    // Extract cache creation tokens from Anthropic provider metadata
    const anthropicMetadata = result.providerMetadata?.anthropic as
      | { cacheCreationInputTokens?: number }
      | undefined;
    const cacheCreationInputTokens =
      typeof anthropicMetadata?.cacheCreationInputTokens === 'number'
        ? anthropicMetadata.cacheCreationInputTokens
        : 0;

    // Claude Sonnet 4 pricing:
    // - Input tokens: $3/M
    // - Cache writes: $3.75/M (25% surcharge)
    // - Cache reads: $0.30/M (90% discount)
    // - Output tokens: $15/M
    const inputCost = (inputTokens / 1_000_000) * 3;
    const cacheWriteCost = (cacheCreationInputTokens / 1_000_000) * 3.75;
    const cacheReadCost = (cacheReadInputTokens / 1_000_000) * 0.3;
    const outputCost = (outputTokens / 1_000_000) * 15;
    const totalCost = inputCost + cacheWriteCost + cacheReadCost + outputCost;

    const decimalPrecision = 4;

    return {
      inputTokens,
      outputTokens,
      totalTokens,
      cacheCreationInputTokens:
        cacheCreationInputTokens > 0 ? cacheCreationInputTokens : undefined,
      cacheReadInputTokens:
        cacheReadInputTokens > 0 ? cacheReadInputTokens : undefined,
      inputCost: Number(inputCost.toFixed(decimalPrecision)),
      outputCost: Number(outputCost.toFixed(decimalPrecision)),
      totalCost: Number(totalCost.toFixed(decimalPrecision)),
      estimatedCost: Number(totalCost.toFixed(decimalPrecision)),
    };
  }
}

export const llmService = new LLMService();
