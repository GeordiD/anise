import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import * as schema from './schema'
import { seedDatabase } from './seed'

const client = new PGlite('./data/db')
export const db = drizzle(client, { schema })

let initialized = false

async function initializeDatabase() {
  if (initialized) return
  
  // Run migrations and seed data
  await migrate(db, { migrationsFolder: './server/db/migrations' })
  await seedDatabase(db)
  
  initialized = true
}

// Initialize database on first use
export async function getDb() {
  await initializeDatabase()
  return db
}

export { schema }