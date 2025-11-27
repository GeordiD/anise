import { eq } from 'drizzle-orm';
import { getDb } from '~~/server/db';
import { step as stepTable } from '~~/server/db/schema';
import { requireJobId } from './jobContext';
import { stepContext } from './stepContext';

/* eslint-disable @typescript-eslint/unified-signatures */
// Overload for single-parameter functions - accept the parameter directly
export async function step<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TFn extends (arg: any) => unknown
>(
  name: string,
  fn: TFn,
  arg: Parameters<TFn>[0],
  initialMetadata?: Record<string, unknown>
): Promise<Awaited<ReturnType<TFn>>>;

// Overload for multi-parameter functions - require tuple
export async function step<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TFn extends (...args: any[]) => unknown
>(
  name: string,
  fn: TFn,
  args: Parameters<TFn>,
  initialMetadata?: Record<string, unknown>
): Promise<Awaited<ReturnType<TFn>>>;
/* eslint-enable @typescript-eslint/unified-signatures */

// Implementation
export async function step(
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any[]) => unknown,
  propsOrArg: unknown,
  initialMetadata?: Record<string, unknown>
): Promise<unknown> {
  const jobId = requireJobId();
  const db = await getDb();

  // Normalize to array - if it's not already an array, wrap it
  const props: unknown[] = Array.isArray(propsOrArg)
    ? propsOrArg
    : [propsOrArg];

  // Create mutable metadata object
  const metadata: Record<string, unknown> = initialMetadata ?? {};
  const context = { metadata };

  // Insert step record at start
  const [insertedStep] = await db
    .insert(stepTable)
    .values({
      jobId,
      name,
      input: (props.length === 1 ? props[0] : props) as unknown,
      metadata,
    })
    .returning();

  if (!insertedStep) {
    throw new Error('Failed to create step');
  }

  try {
    const result = await stepContext.run(context, async () => {
      return await fn(...props);
    });

    await db
      .update(stepTable)
      .set({
        output: result as unknown,
        metadata,
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
        metadata,
        completedAt: new Date(),
      })
      .where(eq(stepTable.id, insertedStep.id));

    throw error;
  }
}
