import { createAnthropic } from '@ai-sdk/anthropic';
import { db } from '~~/server/db';
import { tokenUsage } from '~~/server/db/schema';
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

  // I wrote this but never used it. I'd like to, but hit roadblocks
  // maybe dead? maybe gonna get revived.
  async logUsage(
    usage: {
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
    },
    // TODO: rethink this. I think AsyncLocalStorage might be nice here
    metadata: {
      recipeId: number;
    }
  ): Promise<UsageStats> {
    const stats = this.calculateUsage(usage);

    await db.insert(tokenUsage).values({
      recipeId: metadata.recipeId,
      inputTokens: stats.inputTokens,
      outputTokens: stats.outputTokens,
      totalTokens: stats.totalTokens,
      inputCost: stats.inputCost.toString(),
      outputCost: stats.outputCost.toString(),
      totalCost: stats.totalCost.toString(),
    });

    return stats;
  }

  calculateUsage(usage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    cacheCreationInputTokens?: number;
    cacheReadInputTokens?: number;
  }): UsageStats {
    const inputTokens = usage.inputTokens ?? 0;
    const outputTokens = usage.outputTokens ?? 0;
    const totalTokens = usage.totalTokens ?? 0;
    const cacheCreationInputTokens = usage.cacheCreationInputTokens ?? 0;
    const cacheReadInputTokens = usage.cacheReadInputTokens ?? 0;

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
