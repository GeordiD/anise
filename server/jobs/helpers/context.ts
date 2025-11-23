import { AsyncLocalStorage } from 'node:async_hooks';

interface JobContext {
  jobId: number;
}

export const jobContext = new AsyncLocalStorage<JobContext>();

export function getJobId(): number | undefined {
  return jobContext.getStore()?.jobId;
}

export function requireJobId(): number {
  const jobId = getJobId();
  if (jobId === undefined) {
    throw new Error('No job context available. This function must be called within a job.');
  }
  return jobId;
}
