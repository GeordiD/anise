import { mealPlanService } from '../../services/mealPlanService';

export default defineEventHandler(async () => {
  await mealPlanService.clearAllMeals();

  return {
    success: true,
  };
});

defineRouteMeta({
  openAPI: {
    tags: ['Meal Plan'],
    summary: 'Clear all meals',
    description: 'Removes all meals from the entire meal plan',
  },
});
