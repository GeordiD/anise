import { AsyncLocalStorage } from 'node:async_hooks';

interface StepContext<TMetadata = unknown> {
  metadata: TMetadata;
}

export const stepContext = new AsyncLocalStorage<StepContext<unknown>>();

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
