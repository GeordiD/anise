import { AsyncLocalStorage } from 'node:async_hooks';

export type JobMetadata = {
  usage?: UsageStats;
} & Record<string, unknown>;

export interface JobContext {
  jobId: number;
  metadata?: JobMetadata;
}

export const jobContext = new AsyncLocalStorage<JobContext>();

export function getJobContext(): JobContext | undefined {
  return jobContext.getStore();
}

export function requireJobContext(): JobContext {
  const context = getJobContext();
  if (!context) {
    throw new Error(
      'No job context available. This function must be called within a job.'
    );
  }
  return context;
}

export function hasJobContext(): boolean {
  return !!getJobContext();
}

export function setJobMetadata(updates: Record<string, unknown>): void {
  const context = requireJobContext();

  if (context.metadata) {
    Object.assign(context.metadata as object, updates);
  } else {
    context.metadata = updates;
  }
}

export function updateJobUsage(newStats: UsageStats) {
  const context = requireJobContext();

  const existing = context.metadata?.usage ?? new UsageStats();
  const updated = existing.addFromUsageStats(newStats);

  setJobMetadata({ usage: updated });
}
