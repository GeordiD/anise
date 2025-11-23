import * as cheerio from 'cheerio';
import { ingredientService } from '~~/server/services/ingredientService';
import { extractRecipe } from '~~/server/services/prompts/extractRecipe';
import { parseIngredient } from '~~/server/services/prompts/parseIngredient';
import { UsageStats } from '~~/server/utils/UsageStats';
import { getDb } from '../db';
import {
  recipeIngredientGroups,
  recipeIngredients,
  recipeInstructions,
  recipeNotes,
  recipes,
  tokenUsage,
} from '../db/schema';
import type { ParsedIngredient } from '../schemas/ingredientSchema';
import type { RecipeData } from '../schemas/recipeSchema';

/**
 * Mapped ingredient data combining raw text with parsed components
 */
interface MappedIngredient {
  raw: string; // Original ingredient text
  parsed: ParsedIngredient;
  standardizedIngredientId: number;
}

/**
 * Ingredient group with mapped data
 */
interface MappedIngredientGroup {
  name?: string;
  items: string[]; // Keep original for backwards compatibility
  mappedItems?: MappedIngredient[]; // New structured data
}

/**
 * Recipe data with mapped ingredients
 */
interface RecipeDataWithMappedIngredients
  extends Omit<RecipeData, 'ingredients'> {
  ingredients: MappedIngredientGroup[];
}

export interface RecipeContentResult {
  success: boolean;
  url: string;
  recipe: RecipeData & { id: number };
  usage?: UsageStats;
}

class RecipeScraper {
  async fetchByUrl(url: string): Promise<RecipeContentResult> {
    const cleanedContent = await this.fetchAndCleanContent(url);
    const extractResult = await extractRecipe(cleanedContent);

    // Map ingredients to standardized format
    const { recipe: mappedRecipe, usage: mappingUsage } =
      await this.mapIngredients(extractResult.recipe);

    // Combine usage stats from extraction and mapping
    const totalUsage = extractResult.usage.addFromUsageStats(mappingUsage);

    // Save recipe to database
    const savedRecipe = await this.saveRecipeToDatabase(
      mappedRecipe,
      url,
      totalUsage
    );

    return {
      success: true,
      url: url,
      recipe: savedRecipe,
      usage: totalUsage,
    };
  }

  private async fetchAndCleanContent(url: string): Promise<string> {
    // Fetch the webpage
    const response = await fetch(url);

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to fetch URL: ${response.statusText}`,
      });
    }

    const html = await response.text();

    // Parse with cheerio and extract clean content
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $(
      'script, style, nav, header, footer, aside, .advertisement, .ads, .social-share'
    ).remove();

    // Try to find main content areas (common selectors for recipe sites)
    let content = '';
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.recipe',
      '.entry-content',
      '.post-content',
      '.content',
    ];

    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length && element.html()?.trim()) {
        content = element.html()?.trim() || '';
        break;
      }
    }

    // Fallback to body if no main content found
    if (!content) {
      content = $('body').html()?.trim() || '';
    }

    // Convert HTML to more readable text while preserving structure
    const cleanedContent = content
      .replace(/<h[1-6][^>]*>/gi, '\n### ') // Convert headings to markdown-style
      .replace(/<\/h[1-6]>/gi, '\n')
      .replace(/<li[^>]*>/gi, '\n• ') // Convert list items to bullet points
      .replace(/<\/li>/gi, '')
      .replace(/<p[^>]*>/gi, '\n') // Convert paragraphs to single line breaks
      .replace(/<\/p>/gi, '\n')
      .replace(/<br[^>]*>/gi, '\n') // Convert breaks to line breaks
      .replace(/<[^>]+>/g, ' ') // Remove remaining HTML tags
      .replace(/[ \t]+/g, ' ') // Clean up multiple spaces
      .replace(/\n /g, '\n') // Remove spaces after newlines
      .replace(/\n{3,}/g, '\n\n') // Clean up multiple newlines to max 2 (do this last)
      .trim();

    return cleanedContent;
  }

  /**
   * Map raw ingredient text to standardized ingredients with structured data
   * Returns the recipe with mapped ingredients and accumulated usage stats
   */
  private async mapIngredients(
    recipe: RecipeData
  ): Promise<{ recipe: RecipeDataWithMappedIngredients; usage: UsageStats }> {
    const mappedGroups: MappedIngredientGroup[] = [];
    const totalUsage = new UsageStats();

    // Process each ingredient group
    for (const group of recipe.ingredients) {
      const mappedItems: MappedIngredient[] = [];

      // Process each ingredient in the group
      for (const rawIngredient of group.items) {
        try {
          // Step 1: Parse the raw ingredient text
          const { parsed, usage: parseUsage } = await parseIngredient(
            rawIngredient
          );

          // Accumulate parsing usage
          totalUsage.inputTokens += parseUsage.inputTokens;
          totalUsage.outputTokens += parseUsage.outputTokens;
          totalUsage.totalTokens += parseUsage.totalTokens;
          totalUsage.inputCost += parseUsage.inputCost;
          totalUsage.outputCost += parseUsage.outputCost;
          totalUsage.totalCost += parseUsage.totalCost;

          // Step 2: Match or create standardized ingredient
          const { ingredient, usage: matchUsage } =
            await ingredientService.createOrMatchIngredient(parsed.name);

          // Accumulate matching usage
          totalUsage.inputTokens += matchUsage.inputTokens;
          totalUsage.outputTokens += matchUsage.outputTokens;
          totalUsage.totalTokens += matchUsage.totalTokens;
          totalUsage.inputCost += matchUsage.inputCost;
          totalUsage.outputCost += matchUsage.outputCost;
          totalUsage.totalCost += matchUsage.totalCost;

          // Step 3: Store the mapped data
          mappedItems.push({
            raw: rawIngredient,
            parsed,
            standardizedIngredientId: ingredient.id,
          });
        } catch (error) {
          console.error(`Failed to map ingredient "${rawIngredient}":`, error);
          // On error, we could either:
          // 1. Throw and fail the entire recipe import
          // 2. Skip this ingredient and continue
          // 3. Fall back to storing just the raw text
          // For now, let's re-throw to fail the import
          throw error;
        }
      }

      mappedGroups.push({
        name: group.name,
        items: group.items, // Keep original for backwards compatibility
        mappedItems,
      });
    }

    return {
      recipe: {
        ...recipe,
        ingredients: mappedGroups,
      },
      usage: totalUsage,
    };
  }

  private async saveRecipeToDatabase(
    recipeData: RecipeData | RecipeDataWithMappedIngredients,
    sourceUrl: string,
    usage: UsageStats
  ): Promise<RecipeData & { id: number }> {
    const db = await getDb();

    // Use a transaction to ensure all data is saved atomically
    return await db.transaction(async (tx) => {
      // 1. Insert the main recipe
      const [savedRecipe] = await tx
        .insert(recipes)
        .values({
          name: recipeData.name,
          prepTime: recipeData.prepTime || null,
          cookTime: recipeData.cookTime || null,
          totalTime: recipeData.totalTime || null,
          servings: recipeData.servings || null,
          cuisine: recipeData.cuisine || null,
          sourceUrl: sourceUrl,
        })
        .returning();

      if (!savedRecipe) {
        throw new Error('Failed to create recipe');
      }

      // 2. Insert ingredient groups and ingredients
      for (
        let groupIndex = 0;
        groupIndex < recipeData.ingredients.length;
        groupIndex++
      ) {
        const ingredientGroup = recipeData.ingredients[groupIndex];

        if (!ingredientGroup) continue;

        const [savedGroup] = await tx
          .insert(recipeIngredientGroups)
          .values({
            recipeId: savedRecipe.id,
            name: ingredientGroup.name || null,
            sortOrder: groupIndex,
          })
          .returning();

        if (!savedGroup) {
          throw new Error('Failed to create ingredient group');
        }

        // Insert ingredients for this group
        // Check if this group has mapped ingredients (new format)
        if ('mappedItems' in ingredientGroup && ingredientGroup.mappedItems) {
          // New format: save structured data
          for (
            let itemIndex = 0;
            itemIndex < ingredientGroup.mappedItems.length;
            itemIndex++
          ) {
            const mappedItem = ingredientGroup.mappedItems[itemIndex];
            if (mappedItem) {
              await tx.insert(recipeIngredients).values({
                groupId: savedGroup.id,
                ingredient: mappedItem.raw, // Keep raw text for backwards compatibility
                ingredientId: mappedItem.standardizedIngredientId,
                quantity: mappedItem.parsed.quantity,
                unit: mappedItem.parsed.unit,
                note: mappedItem.parsed.note,
                sortOrder: itemIndex,
              });
            }
          }
        } else {
          // Old format: just save raw text
          for (
            let itemIndex = 0;
            itemIndex < ingredientGroup.items.length;
            itemIndex++
          ) {
            const ingredient = ingredientGroup.items[itemIndex];
            if (ingredient) {
              await tx.insert(recipeIngredients).values({
                groupId: savedGroup.id,
                ingredient: ingredient,
                sortOrder: itemIndex,
              });
            }
          }
        }
      }

      // 3. Insert instructions
      for (
        let stepIndex = 0;
        stepIndex < recipeData.instructions.length;
        stepIndex++
      ) {
        const instruction = recipeData.instructions[stepIndex];
        if (instruction) {
          await tx.insert(recipeInstructions).values({
            recipeId: savedRecipe.id,
            instruction: instruction,
            stepNumber: stepIndex + 1,
          });
        }
      }

      // 4. Insert notes (if any)
      if (recipeData.notes && recipeData.notes.length > 0) {
        for (
          let noteIndex = 0;
          noteIndex < recipeData.notes.length;
          noteIndex++
        ) {
          const note = recipeData.notes[noteIndex];
          if (note) {
            await tx.insert(recipeNotes).values({
              recipeId: savedRecipe.id,
              note: note,
              sortOrder: noteIndex,
            });
          }
        }
      }

      // 5. Insert token usage
      await tx.insert(tokenUsage).values({
        recipeId: savedRecipe.id,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
        inputCost: usage.inputCost.toString(),
        outputCost: usage.outputCost.toString(),
        totalCost: usage.totalCost.toString(),
      });

      // Return the recipe data with the database ID
      return {
        ...recipeData,
        id: savedRecipe.id,
      };
    });
  }
}

export const recipeScraper = new RecipeScraper();
