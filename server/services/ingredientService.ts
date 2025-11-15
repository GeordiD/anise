import { ilike, or, sql } from 'drizzle-orm';
import type { StandardizedIngredient } from '~~/server/schemas/ingredientSchema';
import { getDb } from '../db';
import { ingredients } from '../db/schema';
import { matchIngredient } from './prompts/matchIngredient';
import type { UsageStats } from './llmService';

class IngredientService {
  /**
   * Find ingredients similar to the given name using fuzzy text search
   * Uses ILIKE for case-insensitive pattern matching
   */
  async findSimilarIngredients(
    name: string,
    limit: number = 20
  ): Promise<StandardizedIngredient[]> {
    const db = await getDb();

    // Extract key words from the ingredient name for better matching
    const words = name.toLowerCase().split(/\s+/);

    // Build ILIKE patterns for each word
    const patterns = words.map((word) => ilike(ingredients.name, `%${word}%`));

    // Find ingredients that match any of the word patterns
    const similarIngredients = await db
      .select({
        id: ingredients.id,
        name: ingredients.name,
      })
      .from(ingredients)
      .where(or(...patterns))
      .limit(limit);

    return similarIngredients;
  }

  /**
   * Create or match an ingredient against existing standardized ingredients
   * Returns the standardized ingredient (either matched or newly created) and usage stats
   */
  async createOrMatchIngredient(parsedName: string): Promise<{
    ingredient: StandardizedIngredient;
    usage: UsageStats;
  }> {
    const db = await getDb();

    // Step 1: Find similar ingredients from the database
    const candidates = await this.findSimilarIngredients(parsedName);

    // Step 2: Use LLM to match against candidates
    const { match, usage } = await matchIngredient(parsedName, candidates);

    // Step 3: Either return matched ingredient or create new one
    if (match.matchedId !== null) {
      // Found a match - return the existing ingredient
      const [existingIngredient] = await db
        .select()
        .from(ingredients)
        .where(sql`${ingredients.id} = ${match.matchedId}`)
        .limit(1);

      if (!existingIngredient) {
        throw createError({
          statusCode: 500,
          statusMessage: `Matched ingredient ID ${match.matchedId} not found in database`,
        });
      }

      return {
        ingredient: existingIngredient,
        usage,
      };
    } else {
      // No match - create new standardized ingredient
      const [newIngredient] = await db
        .insert(ingredients)
        .values({
          name: match.standardizedName,
        })
        .returning();

      if (!newIngredient) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create new ingredient',
        });
      }

      return {
        ingredient: newIngredient,
        usage,
      };
    }
  }

  /**
   * Get an ingredient by ID
   */
  async getById(id: number): Promise<StandardizedIngredient | null> {
    const db = await getDb();
    const [ingredient] = await db
      .select()
      .from(ingredients)
      .where(sql`${ingredients.id} = ${id}`)
      .limit(1);

    return ingredient || null;
  }

  /**
   * Merge duplicate ingredients (for future use)
   * Moves all references from sourceId to targetId, then deletes the source
   */
  async deduplicateIngredients(
    _sourceId: number,
    _targetId: number
  ): Promise<void> {
    // This would need to update all recipe_ingredients that reference sourceId
    // For now, just a placeholder for future implementation
    throw createError({
      statusCode: 501,
      statusMessage: 'Deduplication not yet implemented',
    });
  }
}

export const ingredientService = new IngredientService();
