import { createAnthropic } from '@ai-sdk/anthropic';
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
}

export const llmService = new LLMService();
