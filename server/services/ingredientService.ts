import { eq, ilike, or, sql } from 'drizzle-orm';
import { getDb } from '../db';
import { ingredients } from '../db/schema';
import { matchIngredient } from './prompts/matchIngredient';

class IngredientService {
  /**
   * Find ingredients similar to the given name using fuzzy text search
   * Uses ILIKE for case-insensitive pattern matching
   */
  async findSimilarIngredients(
    name: string,
    limit: number = 20
  ): Promise<{ id: number; name: string }[]> {
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

  async findIngredientByName(name: string) {
    const db = await getDb();

    return await db.query.ingredients.findFirst({
      where: eq(ingredients.name, name),
    });
  }

  /**
   * Create or match an ingredient against existing standardized ingredients
   * Returns the standardized ingredient (either matched or newly created) and usage stats
   */
  async createOrMatchIngredient(parsedName: string): Promise<{
    ingredient: { id: number; name: string };
  }> {
    const db = await getDb();

    // Step 1: If we find an exact match, use that
    const exactMatch = await this.findIngredientByName(parsedName);
    if (exactMatch) {
      return {
        ingredient: exactMatch,
      };
    }

    // Step 2: Find similar ingredients from the database
    const candidates = await this.findSimilarIngredients(parsedName);

    // Step 3: Use LLM to match against candidates
    const { match } = await matchIngredient({ parsedName, candidates });

    // Step 4: Either return matched ingredient or create new one
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
      };
    }
  }

  async createIngredient(name: string) {
    const db = await getDb();

    const [newIngredient] = await db
      .insert(ingredients)
      .values({
        name,
      })
      .returning();

    return newIngredient;
  }
}

export const ingredientService = new IngredientService();
