export interface UsageStats {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cacheCreationInputTokens?: number;
  cacheReadInputTokens?: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  estimatedCost?: number;
}

export const createUsageStats = () => ({
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  cacheCreationInputTokens: 0,
  cacheReadInputTokens: 0,
  inputCost: 0,
  outputCost: 0,
  totalCost: 0,
  estimatedCost: 0,
});
