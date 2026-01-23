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
 *
 *   # Single recipe (add --recipe=<id> to only process one recipe)
 *   ANTHROPIC_API_KEY=sk-... pnpm tsx --tsconfig tsconfig.scripts.json server/scripts/migrations/2025-11-26_migrate-old-ingredients.ts --recipe=123
 */

import { APICallError } from 'ai';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '~~/server/db/schema';
import {
  recipeIngredientGroups,
  recipeIngredients,
  recipes,
} from '~~/server/db/schema';
import { processIngredient } from '~~/server/jobs/add-recipe/processIngredients';
import { job } from '~~/server/jobs/helpers/job';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function migrateOldIngredients() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const recipeArg = args.find((arg) => arg.startsWith('--recipe='));
  const recipeId = recipeArg ? parseInt(recipeArg.split('=')[1], 10) : null;
  const dbUrlArg = args.find((arg) => !arg.startsWith('--'));

  // Get database URL from command line arg or environment variable
  const dbUrl =
    dbUrlArg ||
    process.env.DATABASE_URL ||
    'postgresql://anise_user:anise_password@localhost:5432/anise_db';

  console.log('Starting ingredient migration...');
  console.log(`Database: ${dbUrl.replace(/\/\/.*@/, '//*****@')}`);
  if (recipeId) {
    console.log(`Filtering to recipe ID: ${recipeId}`);
  }
  console.log();

  // Create direct database connection (bypassing getDb() to avoid migrations/seeding)
  const client = postgres(dbUrl, { max: 1 });
  const db = drizzle(client, { schema });

  // Get group IDs for non-deleted recipes (optionally filtered by recipeId)
  const groupsQuery = db
    .select({ id: recipeIngredientGroups.id })
    .from(recipeIngredientGroups)
    .innerJoin(recipes, eq(recipeIngredientGroups.recipeId, recipes.id))
    .where(
      recipeId
        ? and(
            eq(recipeIngredientGroups.recipeId, recipeId),
            isNull(recipes.deletedAt),
          )
        : isNull(recipes.deletedAt),
    );

  const groups = await groupsQuery;
  const groupIds = groups.map((g) => g.id);

  if (groupIds.length === 0) {
    console.log(
      recipeId
        ? `No ingredient groups found for recipe ${recipeId} (or recipe is deleted)`
        : 'No ingredient groups found for non-deleted recipes',
    );
    await client.end();
    return;
  }

  // Fetch all recipe ingredients that haven't been processed yet
  const oldIngredients = await db
    .select()
    .from(recipeIngredients)
    .where(
      and(
        isNull(recipeIngredients.ingredientId),
        inArray(recipeIngredients.groupId, groupIds),
      ),
    );

  console.log(`Found ${oldIngredients.length} ingredients to process\n`);

  if (oldIngredients.length === 0) {
    console.log('No ingredients to migrate!');
    return;
  }

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ id: number; ingredient: string; error: string }> = [];

  // Process ingredients one by one with rate limit handling
  for (const row of oldIngredients) {
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
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
        console.log(
          `✓ [${successCount}/${oldIngredients.length}] "${row.ingredient}"`,
        );
        break; // Success, move to next ingredient
      } catch (error: unknown) {
        // Check for rate limit error (status 429)
        const isRateLimit =
          error instanceof APICallError && error.statusCode === 429;

        if (isRateLimit && error instanceof APICallError) {
          // Try to get retry-after from response headers
          const retryAfter = error.responseHeaders?.['retry-after'];
          const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
          console.log(
            `⏳ Rate limited. Waiting ${waitSeconds} seconds before retry...`,
          );
          await sleep(waitSeconds * 1000);
          retries++;
          continue;
        }

        // Non-rate-limit error
        errorCount++;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        errors.push({
          id: row.id,
          ingredient: row.ingredient,
          error: errorMessage,
        });
        console.error(
          `❌ Failed to process ingredient ${row.id}: "${row.ingredient}"`,
        );
        console.error(`   Error: ${errorMessage}\n`);
        console.error(error);
        break; // Move to next ingredient
      }
    }

    if (retries >= maxRetries) {
      errorCount++;
      errors.push({
        id: row.id,
        ingredient: row.ingredient,
        error: `Max retries (${maxRetries}) exceeded due to rate limiting`,
      });
      console.error(
        `❌ Max retries exceeded for ingredient ${row.id}: "${row.ingredient}"\n`,
      );
    }
  }

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
