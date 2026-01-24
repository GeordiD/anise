import { z } from 'zod';
import { mealPlanService, type MealPlanMeal } from '../../services/mealPlanService';

const addMealSchema = z.object({
  dayId: z.number(),
  mealType: z.enum(['lunch', 'dinner']),
}).and(
  z.union([
    z.object({ recipeId: z.number() }),
    z.object({ customText: z.string().min(1).max(200) }),
  ])
);

export type AddMealRequest = z.infer<typeof addMealSchema>;

export type AddMealResponse = {
  success: boolean;
  meal: MealPlanMeal;
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const validatedData = addMealSchema.parse(body);

  const mealInput = 'recipeId' in validatedData
    ? { recipeId: validatedData.recipeId }
    : { customText: validatedData.customText };

  const meal = await mealPlanService.addMealToDay(
    validatedData.dayId,
    validatedData.mealType,
    mealInput
  );

  return {
    success: true,
    meal,
  };
});

defineRouteMeta({
  openAPI: {
    tags: ['Meal Plan'],
    summary: 'Add recipe to meal plan',
    description: 'Adds a recipe to a specific day and meal type (lunch or dinner)',
  },
});
