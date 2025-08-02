import { getDb, schema } from '../db';

defineRouteMeta({
  openAPI: {
    tags: ['Users'],
  },
});

export default defineEventHandler(async () => {
  const db = await getDb();
  const users = await db.select().from(schema.users);
  return users;
});
