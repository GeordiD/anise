import { mealPlanService } from '../../../services/mealPlanService';

export type DeleteMealResponse = {
  success: boolean;
};

export default defineEventHandler(async (event) => {
  const mealId = Number(getRouterParam(event, 'mealId'));

  if (!mealId || isNaN(mealId)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid meal ID',
    });
  }

  await mealPlanService.removeMeal(mealId);

  return {
    success: true,
  };
});

defineRouteMeta({
  openAPI: {
    tags: ['Meal Plan'],
    summary: 'Remove recipe from meal plan',
    description: 'Removes a specific meal entry from the meal plan by its ID',
  },
});
