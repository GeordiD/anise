import { z } from 'zod';
import { mealPlanService } from '../../../services/mealPlanService';

const updateMealSchema = z.object({
  customText: z.string().min(1).max(200),
});

export type UpdateMealRequest = z.infer<typeof updateMealSchema>;

export type UpdateMealResponse = {
  success: boolean;
};

export default defineEventHandler(async (event) => {
  const mealId = Number(getRouterParam(event, 'mealId'));

  if (isNaN(mealId)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid meal ID',
    });
  }

  const body = await readBody(event);
  const validatedData = updateMealSchema.parse(body);

  await mealPlanService.updateMealCustomText(mealId, validatedData.customText);

  return {
    success: true,
  };
});

defineRouteMeta({
  openAPI: {
    tags: ['Meal Plan'],
    summary: 'Update meal custom text',
    description: 'Updates the custom text of a meal',
  },
});
