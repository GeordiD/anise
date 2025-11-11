import { z } from 'zod';
import { shoppingListService, type ShoppingListItem } from '../../../services/shoppingListService';

const updateItemSchema = z.object({
  ingredientText: z.string().optional(),
  checked: z.boolean().optional(),
});

export type UpdateItemRequest = z.infer<typeof updateItemSchema>;

export type UpdateItemResponse = {
  success: boolean;
  item: ShoppingListItem;
};

export default defineEventHandler(async (event) => {
  const itemId = Number(getRouterParam(event, 'id'));

  if (!itemId || isNaN(itemId)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid item ID',
    });
  }

  const body = await readBody(event);
  const validatedData = updateItemSchema.parse(body);

  if (!validatedData.ingredientText && validatedData.checked === undefined) {
    throw createError({
      statusCode: 400,
      message: 'At least one field (ingredientText or checked) must be provided',
    });
  }

  // For now, we'll use a hardcoded user ID since we don't have auth yet
  const userId = 1;

  const item = await shoppingListService.updateItem(itemId, userId, validatedData);

  return {
    success: true,
    item,
  };
});

defineRouteMeta({
  openAPI: {
    tags: ['Shopping List'],
    summary: 'Update shopping list item',
    description: 'Updates a shopping list item text or checked status',
  },
});
