import { z } from 'zod';
import { mealPlanService } from '../../services/mealPlanService';

const updateSettingsSchema = z.object({
  weekStartDay: z.enum(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']),
});

export type UpdateSettingsRequest = z.infer<typeof updateSettingsSchema>;

export type UpdateSettingsResponse = {
  success: boolean;
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const validatedData = updateSettingsSchema.parse(body);

  await mealPlanService.updateWeekStartDay(validatedData.weekStartDay);

  return {
    success: true,
  };
});

defineRouteMeta({
  openAPI: {
    tags: ['Meal Plan'],
    summary: 'Update meal plan settings',
    description: 'Updates meal plan settings such as the week start day preference',
  },
});
