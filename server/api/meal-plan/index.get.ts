import { mealPlanService, type MealPlan } from '../../services/mealPlanService';

export type MealPlanResponse = {
  success: boolean;
  mealPlan: MealPlan;
};

export default defineEventHandler(async () => {
  const mealPlan = await mealPlanService.getMealPlan();

  return {
    success: true,
    mealPlan,
  };
});

defineRouteMeta({
  openAPI: {
    tags: ['Meal Plan'],
    summary: 'Get meal plan',
    description: 'Retrieves the current meal plan with all days and assigned recipes',
  },
});
