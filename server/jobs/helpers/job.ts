import { eq } from 'drizzle-orm';
import { getDb } from '~~/server/db';
import { job as jobTable } from '~~/server/db/schema';
import type { JobContext } from './jobContext';
import { jobContext } from './jobContext';

export type JobResult<T> = {
  result: T;
  jobId: number;
};

export async function job<T>(
  name: string,
  fn: () => Promise<T>
): Promise<JobResult<T>> {
  const db = await getDb();

  const [insertedJob] = await db
    .insert(jobTable)
    .values({
      workflowName: name,
    })
    .returning();

  if (!insertedJob) {
    throw new Error('Failed to create job');
  }

  const context: JobContext = {
    jobId: insertedJob.id,
    metadata: undefined,
  };

  try {
    const result = await jobContext.run(context, () => fn());

    await db
      .update(jobTable)
      .set({
        completedAt: new Date(),
        metadata: context.metadata,
      })
      .where(eq(jobTable.id, insertedJob.id));

    return {
      result,
      jobId: insertedJob.id,
    };
  } catch (error) {
    await db
      .update(jobTable)
      .set({ completedAt: new Date() })
      .where(eq(jobTable.id, insertedJob.id));

    throw error;
  }
}
