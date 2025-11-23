import { AsyncLocalStorage } from 'node:async_hooks';

interface JobContext {
  jobId: number;
}

interface StepContext<TMetadata = unknown> {
  metadata: TMetadata;
}

export const jobContext = new AsyncLocalStorage<JobContext>();
export const stepContext = new AsyncLocalStorage<StepContext<unknown>>();

export function getJobId(): number | undefined {
  return jobContext.getStore()?.jobId;
}

export function requireJobId(): number {
  const jobId = getJobId();
  if (jobId === undefined) {
    throw new Error(
      'No job context available. This function must be called within a job.'
    );
  }
  return jobId;
}

export function hasStepContext(): boolean {
  return !!stepContext.getStore();
}

export function getStepContext<TMetadata = unknown>():
  | StepContext<TMetadata>
  | undefined {
  return stepContext.getStore() as StepContext<TMetadata> | undefined;
}

export function requireStepContext<
  TMetadata = unknown
>(): StepContext<TMetadata> {
  const context = getStepContext<TMetadata>();
  if (!context) {
    throw new Error(
      'No step context available. This function must be called within a step.'
    );
  }
  return context;
}

export function getStepMetadata<TMetadata = unknown>(): TMetadata {
  return requireStepContext<TMetadata>().metadata;
}

export function setStepMetadata<TMetadata extends object = object>(
  updates: Partial<TMetadata>
): void {
  const context = requireStepContext<TMetadata>();
  Object.assign(context.metadata as object, updates);
}
