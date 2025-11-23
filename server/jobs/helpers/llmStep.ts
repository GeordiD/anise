import { createUsageStats, type UsageStats } from '~~/server/utils/UsageStats';
import { step } from './step';
import { getStepMetadata, setStepMetadata } from './context';

/**
 * A specialized step function for LLM operations that automatically tracks usage statistics.
 * The metadata is pre-typed as UsageStats and initialized with empty stats.
 */
export async function llmStep<TInput, TOutput>(
  name: string,
  fn: (_props: TInput) => Promise<TOutput>,
  props: TInput
): Promise<TOutput> {
  const initialMetadata: UsageStats = createUsageStats();
  return step<TInput, TOutput, UsageStats>(name, fn, props, initialMetadata);
}

/**
 * Hook to access and update usage statistics within an LLM step.
 * Must be called within an llmStep context.
 */
export function useUsageStats() {
  return {
    /**
     * Get the current usage statistics
     */
    get: (): UsageStats => getStepMetadata<UsageStats>(),

    /**
     * Set the usage statistics (replaces all values)
     */
    set: (stats: UsageStats): void => {
      setStepMetadata<UsageStats>(stats);
    },

    /**
     * Add usage statistics to the current totals
     */
    add: (stats: Partial<UsageStats>): void => {
      const current = getStepMetadata<UsageStats>();
      setStepMetadata<UsageStats>({
        inputTokens: (current.inputTokens || 0) + (stats.inputTokens || 0),
        outputTokens: (current.outputTokens || 0) + (stats.outputTokens || 0),
        totalTokens: (current.totalTokens || 0) + (stats.totalTokens || 0),
        cacheCreationInputTokens:
          (current.cacheCreationInputTokens || 0) +
          (stats.cacheCreationInputTokens || 0),
        cacheReadInputTokens:
          (current.cacheReadInputTokens || 0) + (stats.cacheReadInputTokens || 0),
        inputCost: (current.inputCost || 0) + (stats.inputCost || 0),
        outputCost: (current.outputCost || 0) + (stats.outputCost || 0),
        totalCost: (current.totalCost || 0) + (stats.totalCost || 0),
        estimatedCost: (current.estimatedCost || 0) + (stats.estimatedCost || 0),
      });
    },
  };
}
