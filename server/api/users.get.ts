import { getDb, schema } from '../db'

export default defineEventHandler(async (event) => {
  const db = await getDb()
  const users = await db.select().from(schema.users)
  return users
})