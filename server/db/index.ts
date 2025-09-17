import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as schema from './schema'
import { seedDatabase } from './seed'

// Create connection string from environment
const connectionString = process.env.DATABASE_URL || 'postgresql://anise_user:anise_password@localhost:5432/anise_db'

// Create PostgreSQL client
const client = postgres(connectionString, { max: 1 })
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