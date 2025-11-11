<script setup lang="ts">
import type { MealPlanResponse } from '~~/server/api/meal-plan/index.get';
import type { AddMealRequest } from '~~/server/api/meal-plan/meals.post';

definePageMeta({
  title: 'Meal Plan',
});

// Fetch meal plan data
const {
  data: mealPlanData,
  pending,
  error,
  refresh,
} = await useFetch<MealPlanResponse>('/api/meal-plan');

const mealPlan = computed(() => mealPlanData.value?.mealPlan);

async function handleSelectRecipes(
  dayId: number,
  mealType: 'lunch' | 'dinner',
  recipeIds: number[]
) {
  try {
    // Add each selected recipe
    for (const recipeId of recipeIds) {
      const payload: AddMealRequest = {
        dayId,
        mealType,
        recipeId,
      };

      await $fetch('/api/meal-plan/meals', {
        method: 'POST',
        body: payload,
      });
    }

    // Refresh the meal plan data
    await refresh();
  } catch (err) {
    console.error('Failed to add recipes:', err);
    // TODO: Show error toast
  }
}

// Remove meal from plan
async function handleRemoveMeal(mealId: number) {
  try {
    await $fetch(`/api/meal-plan/meals/${mealId}`, {
      method: 'DELETE',
    });

    // Refresh the meal plan data
    await refresh();
  } catch (err) {
    console.error('Failed to remove meal:', err);
    // TODO: Show error toast
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl pb-32">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-default mb-2">Meal Plan</h1>
      <p class="text-muted">Plan your meals for the week</p>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <div class="text-muted">Loading meal plan...</div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-error py-12 text-center">
      <p>Failed to load meal plan. Please try again later.</p>
    </div>

    <!-- Meal plan content -->
    <div v-else-if="mealPlan" class="space-y-6">
      <!-- Days -->
      <div class="space-y-6">
        <MealPlanDay
          v-for="day in mealPlan.days"
          :key="day.id"
          :day="day"
          @select-meals="handleSelectRecipes"
          @remove-meal="handleRemoveMeal"
        />
      </div>
    </div>

    <!-- Fixed bottom action button -->
    <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4">
      <div class="container mx-auto max-w-4xl">
        <UButton
          to="/lists/create"
          color="primary"
          size="lg"
          block
          label="Create Shopping List"
        />
      </div>
    </div>
  </div>
</template>
