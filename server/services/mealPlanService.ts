import { and, eq } from 'drizzle-orm';
import { getDb } from '../db';
import { mealPlanDays, mealPlanMeals, mealPlans } from '../db/schema';

export type MealType = 'lunch' | 'dinner';
export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export type MealPlanMeal = {
  id: number;
  recipeId: number;
  recipeName: string;
  sortOrder: number;
};

export type MealPlanDay = {
  id: number;
  dayOfWeek: DayOfWeek;
  date: string;
  lunch: MealPlanMeal[];
  dinner: MealPlanMeal[];
};

export type MealPlan = {
  id: number;
  weekStartDay: DayOfWeek;
  days: MealPlanDay[];
};

class MealPlanService {
  // For now, we'll use a hardcoded user ID since we don't have auth yet
  private readonly DEFAULT_USER_ID = 1;

  /**
   * Get the current active meal plan for the user, or create one if it doesn't exist
   */
  async getMealPlan(): Promise<MealPlan> {
    const db = await getDb();

    // Check if a meal plan already exists for this user
    let mealPlan = await db.query.mealPlans.findFirst({
      where: eq(mealPlans.userId, this.DEFAULT_USER_ID),
      with: {
        days: {
          with: {
            meals: {
              with: {
                recipe: true,
              },
              orderBy: (meals, { asc }) => [asc(meals.sortOrder)],
            },
          },
          orderBy: (days, { asc }) => [asc(days.date)],
        },
      },
    });

    // If no meal plan exists, create one with 7 days
    if (!mealPlan) {
      mealPlan = await this.createMealPlan('sunday');
    }

    // Transform the data to match our MealPlan type
    return {
      id: mealPlan.id,
      weekStartDay: mealPlan.weekStartDay as DayOfWeek,
      days: mealPlan.days.map((day) => ({
        id: day.id,
        dayOfWeek: day.dayOfWeek as DayOfWeek,
        date: day.date,
        lunch: day.meals
          .filter((meal) => meal.mealType === 'lunch')
          .map((meal) => ({
            id: meal.id,
            recipeId: meal.recipeId,
            recipeName: meal.recipe.name,
            sortOrder: meal.sortOrder,
          })),
        dinner: day.meals
          .filter((meal) => meal.mealType === 'dinner')
          .map((meal) => ({
            id: meal.id,
            recipeId: meal.recipeId,
            recipeName: meal.recipe.name,
            sortOrder: meal.sortOrder,
          })),
      })),
    };
  }

  /**
   * Create a new meal plan with 7 empty days
   */
  private async createMealPlan(weekStartDay: DayOfWeek) {
    const db = await getDb();

    // Create the meal plan
    const [newMealPlan] = await db
      .insert(mealPlans)
      .values({
        userId: this.DEFAULT_USER_ID,
        weekStartDay,
      })
      .returning();

    // Create 7 days for the week
    const daysOfWeek: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // Reorder days based on week start day
    const weekStartIndex = daysOfWeek.indexOf(weekStartDay);
    const orderedDays = [
      ...daysOfWeek.slice(weekStartIndex),
      ...daysOfWeek.slice(0, weekStartIndex),
    ];

    // Calculate dates for the current week
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    const startDayIndex = daysMap[weekStartDay];

    // Calculate how many days to go back to get to the start of the week
    let daysToGoBack = currentDayOfWeek - startDayIndex;
    if (daysToGoBack < 0) {
      daysToGoBack += 7;
    }

    const weekStartDate = new Date(today);
    weekStartDate.setDate(today.getDate() - daysToGoBack);

    const dayRecords = orderedDays.map((day, index) => {
      const date = new Date(weekStartDate);
      date.setDate(weekStartDate.getDate() + index);
      return {
        mealPlanId: newMealPlan!.id,
        dayOfWeek: day,
        date: date.toISOString().split('T')[0]!, // Format as YYYY-MM-DD
      };
    });

    await db.insert(mealPlanDays).values(dayRecords).returning();

    // Fetch the complete meal plan with relations
    const completeMealPlan = await db.query.mealPlans.findFirst({
      where: eq(mealPlans.id, newMealPlan!.id),
      with: {
        days: {
          with: {
            meals: {
              with: {
                recipe: true,
              },
              orderBy: (meals, { asc }) => [asc(meals.sortOrder)],
            },
          },
          orderBy: (days, { asc }) => [asc(days.date)],
        },
      },
    });

    if (!completeMealPlan) {
      throw new Error('Failed to create meal plan');
    }

    return completeMealPlan;
  }

  /**
   * Add a recipe to a specific day and meal type
   */
  async addMealToDay(dayId: number, mealType: MealType, recipeId: number): Promise<MealPlanMeal> {
    const db = await getDb();

    // Get the current max sort order for this day and meal type
    const existingMeals = await db.query.mealPlanMeals.findMany({
      where: and(
        eq(mealPlanMeals.dayId, dayId),
        eq(mealPlanMeals.mealType, mealType)
      ),
    });

    const maxSortOrder = existingMeals.length > 0
      ? Math.max(...existingMeals.map((m) => m.sortOrder))
      : -1;

    // Insert the new meal
    const [newMeal] = await db
      .insert(mealPlanMeals)
      .values({
        dayId,
        mealType,
        recipeId,
        sortOrder: maxSortOrder + 1,
      })
      .returning();

    // Fetch the recipe name
    const mealWithRecipe = await db.query.mealPlanMeals.findFirst({
      where: eq(mealPlanMeals.id, newMeal!.id),
      with: {
        recipe: true,
      },
    });

    if (!mealWithRecipe) {
      throw new Error('Failed to add meal');
    }

    return {
      id: mealWithRecipe.id,
      recipeId: mealWithRecipe.recipeId,
      recipeName: mealWithRecipe.recipe.name,
      sortOrder: mealWithRecipe.sortOrder,
    };
  }

  /**
   * Remove a meal from the meal plan
   */
  async removeMeal(mealId: number): Promise<void> {
    const db = await getDb();

    await db.delete(mealPlanMeals).where(eq(mealPlanMeals.id, mealId));
  }

  /**
   * Update the week start day preference
   */
  async updateWeekStartDay(weekStartDay: DayOfWeek): Promise<void> {
    const db = await getDb();

    // Get the current meal plan
    const mealPlan = await db.query.mealPlans.findFirst({
      where: eq(mealPlans.userId, this.DEFAULT_USER_ID),
    });

    if (!mealPlan) {
      throw new Error('No meal plan found');
    }

    // Update the week start day
    await db
      .update(mealPlans)
      .set({
        weekStartDay,
        updatedAt: new Date(),
      })
      .where(eq(mealPlans.id, mealPlan.id));

    // Delete existing days and meals
    await db.delete(mealPlanDays).where(eq(mealPlanDays.mealPlanId, mealPlan.id));

    // Recreate the days with the new week start
    const daysOfWeek: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    const weekStartIndex = daysOfWeek.indexOf(weekStartDay);
    const orderedDays = [
      ...daysOfWeek.slice(weekStartIndex),
      ...daysOfWeek.slice(0, weekStartIndex),
    ];

    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const daysMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    const startDayIndex = daysMap[weekStartDay];

    let daysToGoBack = currentDayOfWeek - startDayIndex;
    if (daysToGoBack < 0) {
      daysToGoBack += 7;
    }

    const weekStartDate = new Date(today);
    weekStartDate.setDate(today.getDate() - daysToGoBack);

    const dayRecords = orderedDays.map((day, index) => {
      const date = new Date(weekStartDate);
      date.setDate(weekStartDate.getDate() + index);
      return {
        mealPlanId: mealPlan.id,
        dayOfWeek: day,
        date: date.toISOString().split('T')[0]!,
      };
    });

    await db.insert(mealPlanDays).values(dayRecords);
  }
}

export const mealPlanService = new MealPlanService();
