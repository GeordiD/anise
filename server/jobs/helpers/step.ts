import { eq } from 'drizzle-orm';
import { getDb } from '~~/server/db';
import { step as stepTable } from '~~/server/db/schema';
import { requireJobId, stepContext } from './context';

export async function step<TMetadata, TInput, TOutput>(
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

  // Insert step record at start
  const [insertedStep] = await db
    .insert(stepTable)
    .values({
      jobId,
      name,
      input: props as unknown,
      metadata: metadata as unknown,
    })
    .returning();

  if (!insertedStep) {
    throw new Error('Failed to create step');
  }

  try {
    const result = await stepContext.run(context, async () => {
      return await fn(props);
    });

    await db
      .update(stepTable)
      .set({
        output: result as unknown,
        metadata: metadata as unknown,
        completedAt: new Date(),
      })
      .where(eq(stepTable.id, insertedStep.id));

    return result;
  } catch (error) {
    await db
      .update(stepTable)
      .set({
        error: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        metadata: metadata as unknown,
        completedAt: new Date(),
      })
      .where(eq(stepTable.id, insertedStep.id));

    throw error;
  }
}
