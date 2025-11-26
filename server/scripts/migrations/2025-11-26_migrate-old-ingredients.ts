/**
 * Migration script to process old recipe ingredients through the new parsing system.
 *
 * This script updates recipe_ingredients rows that have ingredientId = NULL by:
 * - Parsing the raw ingredient text into structured fields (quantity, unit, note)
 * - Matching/creating standardized ingredients in the ingredients table
 * - Updating the row with the parsed data
 *
 * Requirements:
 *   - ANTHROPIC_API_KEY environment variable must be set (uses Claude for parsing)
 *
 * Usage:
 *   # Local database (uses default or DATABASE_URL env var)
 *   ANTHROPIC_API_KEY=sk-... pnpm tsx --tsconfig tsconfig.scripts.json server/scripts/migrations/2025-11-26_migrate-old-ingredients.ts
 *
 *   # Production database (via environment variable)
 *   ANTHROPIC_API_KEY=sk-... DATABASE_URL=postgresql://user:pass@host:5432/db pnpm tsx --tsconfig tsconfig.scripts.json server/scripts/migrations/2025-11-26_migrate-old-ingredients.ts
 *
 *   # Production database (via command line argument)
 *   ANTHROPIC_API_KEY=sk-... pnpm tsx --tsconfig tsconfig.scripts.json server/scripts/migrations/2025-11-26_migrate-old-ingredients.ts postgresql://user:pass@host:5432/db
 */

import { eq, isNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import pLimit from 'p-limit';
import postgres from 'postgres';
import * as schema from '~~/server/db/schema';
import { recipeIngredients } from '~~/server/db/schema';
import { processIngredient } from '~~/server/jobs/add-recipe/processIngredients';
import { job } from '~~/server/jobs/helpers/job';

async function migrateOldIngredients() {
  // Get database URL from command line arg or environment variable
  const dbUrl =
    process.argv[2] ||
    process.env.DATABASE_URL ||
    'postgresql://anise_user:anise_password@localhost:5432/anise_db';

  console.log('Starting ingredient migration...');
  console.log(`Database: ${dbUrl.replace(/\/\/.*@/, '//*****@')}\n`); // Hide credentials in logs

  // Create direct database connection (bypassing getDb() to avoid migrations/seeding)
  const client = postgres(dbUrl, { max: 1 });
  const db = drizzle(client, { schema });

  // Fetch all recipe ingredients that haven't been processed yet
  const oldIngredients = await db
    .select()
    .from(recipeIngredients)
    .where(isNull(recipeIngredients.ingredientId));

  console.log(`Found ${oldIngredients.length} ingredients to process\n`);

  if (oldIngredients.length === 0) {
    console.log('No ingredients to migrate!');
    return;
  }

  const limit = pLimit(5); // Process 5 ingredients concurrently
  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ id: number; ingredient: string; error: string }> = [];

  // Process ingredients with concurrency control
  const tasks = oldIngredients.map((row) =>
    limit(async () => {
      try {
        // Use existing processIngredient function
        const mapped = await processIngredient(row.ingredient);

        // Update the row with parsed data
        await db
          .update(recipeIngredients)
          .set({
            ingredientId: mapped.ingredientId,
            quantity: mapped.quantity,
            unit: mapped.unit,
            note: mapped.note,
          })
          .where(eq(recipeIngredients.id, row.id));

        successCount++;
        if (successCount % 10 === 0) {
          console.log(
            `Progress: ${successCount}/${oldIngredients.length} processed`
          );
        }
      } catch (error) {
        errorCount++;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        errors.push({
          id: row.id,
          ingredient: row.ingredient,
          error: errorMessage,
        });
        console.error(
          `❌ Failed to process ingredient ${row.id}: "${row.ingredient}"`
        );
        console.error(`   Error: ${errorMessage}\n`);
      }
    })
  );

  await Promise.all(tasks);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('Migration Complete!');
  console.log('='.repeat(60));
  console.log(`✅ Successfully processed: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log('='.repeat(60) + '\n');

  if (errors.length > 0) {
    console.log('Errors:');
    errors.forEach(({ id, ingredient, error }) => {
      console.log(`  ID ${id}: "${ingredient}"`);
      console.log(`    → ${error}\n`);
    });
  }

  // Close database connection
  await client.end();
}

// Run the migration
job('migrate-old-ingredients', migrateOldIngredients)
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
