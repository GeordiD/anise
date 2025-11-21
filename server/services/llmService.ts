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
  }): UsageStats {
    const inputTokens = usage.inputTokens ?? 0;
    const outputTokens = usage.outputTokens ?? 0;
    const totalTokens = usage.totalTokens ?? 0;

    // Claude Sonnet 4 pricing: $3/M input, $15/M output
    const inputCost = (inputTokens / 1_000_000) * 3;
    const outputCost = (outputTokens / 1_000_000) * 15;
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
