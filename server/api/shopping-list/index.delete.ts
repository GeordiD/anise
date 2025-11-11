import { shoppingListService } from '../../services/shoppingListService';

export type ClearShoppingListResponse = {
  success: boolean;
};

export default defineEventHandler(async () => {
  // For now, we'll use a hardcoded user ID since we don't have auth yet
  const userId = 1;

  // Get the current meal plan for the user
  const mealPlan = await $fetch('/api/meal-plan');

  if (!mealPlan?.mealPlan?.id) {
    throw createError({
      statusCode: 404,
      message: 'No meal plan found',
    });
  }

  await shoppingListService.clearList(userId, mealPlan.mealPlan.id);

  return {
    success: true,
  };
});

defineRouteMeta({
  openAPI: {
    tags: ['Shopping List'],
    summary: 'Clear shopping list',
    description: 'Clears all items from the shopping list',
  },
});
