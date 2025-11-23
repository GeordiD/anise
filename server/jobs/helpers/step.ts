import { getDb } from '~~/server/db';
import { step as stepTable } from '~~/server/db/schema';
import { requireJobId, stepContext } from './context';

export async function step<TInput, TOutput, TMetadata = unknown>(
  name: string,
  fn: (_props: TInput) => Promise<TOutput>,
  props: TInput,
  initialMetadata?: TMetadata
): Promise<TOutput> {
  const jobId = requireJobId();
  const db = await getDb();

  // Create mutable metadata object
  const metadata = (initialMetadata ?? {}) as TMetadata;
  const context = { metadata };

  try {
    const result = await stepContext.run(context, async () => {
      return await fn(props);
    });

    await db.insert(stepTable).values({
      jobId,
      name,
      input: props as unknown,
      output: result as unknown,
      metadata: metadata as unknown,
    });

    return result;
  } catch (error) {
    await db.insert(stepTable).values({
      jobId,
      name,
      input: props as unknown,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      metadata: metadata as unknown,
    });

    throw error;
  }
}
