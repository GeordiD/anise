import * as schema from './schema'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

export async function seedDatabase(db: PostgresJsDatabase<typeof schema>) {
  // Check if users already exist
  const existingUsers = await db.select().from(schema.users).limit(1)
  if (existingUsers.length > 0) {
    console.log('Database already seeded')
    return
  }

  // Insert sample users
  await db.insert(schema.users).values([
    { email: 'john@example.com', name: 'John Doe' },
    { email: 'jane@example.com', name: 'Jane Smith' },
  ])

  console.log('Database seeded with sample data')
}