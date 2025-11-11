import { shoppingListService, type ShoppingList } from '../../services/shoppingListService';

export type GetShoppingListResponse = {
  success: boolean;
  list: ShoppingList;
};

export default defineEventHandler(async () => {
  // For now, we'll use a hardcoded user ID since we don't have auth yet
  const userId = 1;

  const list = await shoppingListService.getActiveList(userId);

  if (!list) {
    throw createError({
      statusCode: 404,
      message: 'No active shopping list found',
    });
  }

  return {
    success: true,
    list,
  };
});

defineRouteMeta({
  openAPI: {
    tags: ['Shopping List'],
    summary: 'Get active shopping list',
    description: 'Retrieves the active shopping list for the user with all items',
  },
});
