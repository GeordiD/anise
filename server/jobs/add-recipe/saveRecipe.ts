import { getDb } from '~~/server/db';
import {
  recipeIngredientGroups,
  recipeIngredients,
  recipeInstructions,
  recipeNotes,
  recipes,
} from '~~/server/db/schema';
import type { RecipeDataWithMappedIngredients } from '~~/server/jobs/add-recipe';

export async function saveRecipe(
  recipeData: RecipeDataWithMappedIngredients,
  sourceUrl: string
): Promise<{ id: number }> {
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
      for (
        let itemIndex = 0;
        itemIndex < ingredientGroup.mappedItems.length;
        itemIndex++
      ) {
        const mappedItem = ingredientGroup.mappedItems[itemIndex];
        if (mappedItem) {
          await tx.insert(recipeIngredients).values({
            groupId: savedGroup.id,
            ingredient: mappedItem.ingredient, // Keep raw text for backwards compatibility
            ingredientId: mappedItem.ingredientId,
            quantity: mappedItem.quantity,
            unit: mappedItem.unit,
            note: mappedItem.note,
            sortOrder: itemIndex,
          });
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

    // Return the recipe data with the database ID
    return {
      id: savedRecipe.id,
    };
  });
}
