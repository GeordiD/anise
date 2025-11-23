import { UsageStats } from '~~/server/utils/UsageStats';
import { step } from './step';

export type LlmStepMetadata = {
  usage: UsageStats;
};

export async function llmStep<TInput, TOutput>(
  name: string,
  fn: (_props: TInput) => Promise<TOutput>,
  props: TInput
): Promise<TOutput> {
  const initialMetadata: UsageStats = new UsageStats();
  return step<TInput, TOutput, LlmStepMetadata>(name, fn, props, {
    usage: initialMetadata,
  });
}
