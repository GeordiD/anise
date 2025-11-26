import { eq, ilike, or } from 'drizzle-orm';
import { getDb } from '../db';
import { ingredients } from '../db/schema';

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
