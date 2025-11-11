<script setup lang="ts">
import type { MealPlanDay } from '~~/server/services/mealPlanService';

const props = defineProps<{
  day: MealPlanDay;
}>();

const emit = defineEmits<{
  selectMeals: [dayId: number, mealType: 'lunch' | 'dinner', mealIds: number[]];
  removeMeal: [mealId: number];
}>();

// Format day name (e.g., "Monday" from "monday")
const dayName = computed(() => {
  return (
    props.day.dayOfWeek.charAt(0).toUpperCase() + props.day.dayOfWeek.slice(1)
  );
});
</script>

<template>
  <div class="border-b border-neutral-200 dark:border-neutral-700 pb-4">
    <div class="mb-3">
      <h3 class="text-lg font-semibold text-default">
        {{ dayName }}
      </h3>
    </div>

    <div class="space-y-4">
      <!-- Lunch -->
      <MealPlanMealSlot
        :day-id="day.id"
        meal-type="lunch"
        :meals="day.lunch"
        @select-meals="(...args) => emit('selectMeals', ...args)"
        @remove-meal="(...args) => emit('removeMeal', ...args)"
      />

      <!-- Dinner -->
      <MealPlanMealSlot
        :day-id="day.id"
        meal-type="dinner"
        :meals="day.dinner"
        @select-meals="(...args) => emit('selectMeals', ...args)"
        @remove-meal="(...args) => emit('removeMeal', ...args)"
      />
    </div>
  </div>
</template>
