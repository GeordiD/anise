import { z } from 'zod';
import { shoppingListService, type ShoppingListItem } from '../../services/shoppingListService';

const addItemsSchema = z.object({
  items: z.array(
    z.object({
      recipeId: z.number().nullable(),
      ingredientText: z.string(),
    })
  ),
});

export type AddItemsRequest = z.infer<typeof addItemsSchema>;

export type AddItemsResponse = {
  success: boolean;
  items: ShoppingListItem[];
};

export default defineEventHandler(async (event) => {
  // For now, we'll use a hardcoded user ID since we don't have auth yet
  const userId = 1;

  const body = await readBody(event);
  const { items } = addItemsSchema.parse(body);

  // Get the current meal plan for the user
  const mealPlan = await $fetch('/api/meal-plan');

  if (!mealPlan?.mealPlan?.id) {
    throw createError({
      statusCode: 404,
      message: 'No meal plan found',
    });
  }

  const addedItems = await shoppingListService.addItems(userId, mealPlan.mealPlan.id, items);

  return {
    success: true,
    items: addedItems,
  };
});

defineRouteMeta({
  openAPI: {
    tags: ['Shopping List'],
    summary: 'Add items to shopping list',
    description: 'Add selected ingredients to the shopping list',
  },
});
