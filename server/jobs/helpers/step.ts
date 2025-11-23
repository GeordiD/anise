import { getDb } from '~~/server/db';
import { step as stepTable } from '~~/server/db/schema';
import { requireJobId } from './context';

export async function step<TInput, TOutput>(
  name: string,
  fn: (_props: TInput) => Promise<TOutput>,
  props: TInput
): Promise<TOutput> {
  const jobId = requireJobId();
  const db = await getDb();

  try {
    const result = await fn(props);

    await db.insert(stepTable).values({
      jobId,
      name,
      input: props as unknown,
      output: result as unknown,
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
    });

    throw error;
  }
}
