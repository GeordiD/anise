import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { shoppingListItems, mealPlans } from '../db/schema';

export type ShoppingListItem = {
  id: number;
  recipeId: number | null;
  recipeName: string | null;
  ingredientText: string;
  checked: boolean;
  sortOrder: number;
};

export type ShoppingList = {
  mealPlanId: number;
  items: ShoppingListItem[];
};

class ShoppingListService {
  /**
   * Add items to the shopping list (clears existing list first)
   */
  async addItems(
    userId: number,
    mealPlanId: number,
    items: Array<{ recipeId: number | null; ingredientText: string }>
  ): Promise<ShoppingListItem[]> {
    const db = await getDb();

    // Verify the meal plan belongs to the user
    const mealPlan = await db.query.mealPlans.findFirst({
      where: eq(mealPlans.id, mealPlanId),
    });

    if (!mealPlan) {
      throw createError({
        statusCode: 404,
        message: 'Meal plan not found',
      });
    }

    if (mealPlan.userId !== userId) {
      throw createError({
        statusCode: 403,
        message: 'Not authorized to modify this shopping list',
      });
    }

    // Clear existing shopping list items for this meal plan
    await db.delete(shoppingListItems).where(eq(shoppingListItems.mealPlanId, mealPlanId));

    // Start sort order from 0
    let sortOrder = 0;

    // Insert items
    const itemsToInsert = items.map((item) => ({
      mealPlanId,
      recipeId: item.recipeId,
      ingredientText: item.ingredientText,
      sortOrder: sortOrder++,
      checked: false,
    }));

    await db.insert(shoppingListItems).values(itemsToInsert).returning();

    // Fetch with recipe names
    const result = await db.query.shoppingListItems.findMany({
      where: eq(shoppingListItems.mealPlanId, mealPlanId),
      with: {
        recipe: true,
      },
      orderBy: (items, { asc }) => [asc(items.sortOrder)],
    });

    return result.map((item) => ({
      id: item.id,
      recipeId: item.recipeId,
      recipeName: item.recipe?.name || null,
      ingredientText: item.ingredientText,
      checked: item.checked,
      sortOrder: item.sortOrder,
    }));
  }

  /**
   * Get the active shopping list for a user (based on their current meal plan)
   */
  async getActiveList(userId: number): Promise<ShoppingList | null> {
    const db = await getDb();

    // Get the user's current meal plan
    const mealPlan = await db.query.mealPlans.findFirst({
      where: eq(mealPlans.userId, userId),
    });

    if (!mealPlan) {
      return null;
    }

    // Get all shopping list items for this meal plan
    const items = await db.query.shoppingListItems.findMany({
      where: eq(shoppingListItems.mealPlanId, mealPlan.id),
      with: {
        recipe: true,
      },
      orderBy: (items, { asc }) => [asc(items.sortOrder)],
    });

    if (items.length === 0) {
      return null;
    }

    return {
      mealPlanId: mealPlan.id,
      items: items.map((item) => ({
        id: item.id,
        recipeId: item.recipeId,
        recipeName: item.recipe?.name || null,
        ingredientText: item.ingredientText,
        checked: item.checked,
        sortOrder: item.sortOrder,
      })),
    };
  }

  /**
   * Update a shopping list item
   */
  async updateItem(
    itemId: number,
    userId: number,
    updates: { ingredientText?: string; checked?: boolean }
  ): Promise<ShoppingListItem> {
    const db = await getDb();

    // Verify the item belongs to the user's meal plan
    const item = await db.query.shoppingListItems.findFirst({
      where: eq(shoppingListItems.id, itemId),
      with: {
        mealPlan: true,
        recipe: true,
      },
    });

    if (!item) {
      throw createError({
        statusCode: 404,
        message: 'Shopping list item not found',
      });
    }

    if (item.mealPlan.userId !== userId) {
      throw createError({
        statusCode: 403,
        message: 'Not authorized to update this item',
      });
    }

    // Update the item
    const [updatedItem] = await db
      .update(shoppingListItems)
      .set({
        ...(updates.ingredientText !== undefined && { ingredientText: updates.ingredientText }),
        ...(updates.checked !== undefined && { checked: updates.checked }),
      })
      .where(eq(shoppingListItems.id, itemId))
      .returning();

    if (!updatedItem) {
      throw createError({
        statusCode: 500,
        message: 'Failed to update item',
      });
    }

    return {
      id: updatedItem.id,
      recipeId: updatedItem.recipeId,
      recipeName: item.recipe?.name || null,
      ingredientText: updatedItem.ingredientText,
      checked: updatedItem.checked,
      sortOrder: updatedItem.sortOrder,
    };
  }

  /**
   * Delete all shopping list items for a meal plan
   */
  async clearList(userId: number, mealPlanId: number): Promise<void> {
    const db = await getDb();

    // Verify the meal plan belongs to the user
    const mealPlan = await db.query.mealPlans.findFirst({
      where: eq(mealPlans.id, mealPlanId),
    });

    if (!mealPlan) {
      throw createError({
        statusCode: 404,
        message: 'Meal plan not found',
      });
    }

    if (mealPlan.userId !== userId) {
      throw createError({
        statusCode: 403,
        message: 'Not authorized to delete this shopping list',
      });
    }

    // Delete all items for this meal plan
    await db.delete(shoppingListItems).where(eq(shoppingListItems.mealPlanId, mealPlanId));
  }
}

export const shoppingListService = new ShoppingListService();
