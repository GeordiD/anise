<script setup lang="ts">
import type { MealPlanMeal } from '~~/server/services/mealPlanService';
import MealPlanRecipeModal from './MealPlanRecipeModal.vue';

const props = defineProps<{
  dayId: number;
  mealType: 'lunch' | 'dinner';
  meals: MealPlanMeal[];
}>();

const mealLabel = computed(() => (props.mealType === 'lunch' ? 'L' : 'D'));

const overlay = useOverlay();
const recipeModal = overlay.create(MealPlanRecipeModal);

function openRecipeModal() {
  recipeModal.open({
    dayId: props.dayId,
    mealType: props.mealType,
  });
}

// Remove meal from plan
async function handleRemoveMeal(mealId: number) {
  try {
    await $fetch(`/api/meal-plan/meals/${mealId}`, {
      method: 'DELETE',
    });

    // Refresh the meal plan data
    await refreshNuxtData('meal-plan');
  } catch (err) {
    console.error('Failed to remove meal:', err);
    // TODO: Show error toast
  }
}
</script>

<template>
  <div class="space-y-1">
    <!-- Meal rows -->
    <div
      v-for="meal in meals"
      :key="meal.id"
      class="flex items-center gap-3"
    >
      <!-- Column 1: L/D label (only on first row) -->
      <div class="text-default font-medium w-6">
        {{ meals.indexOf(meal) === 0 ? mealLabel : '' }}
      </div>

      <!-- Column 2: Meal content -->
      <div class="flex-1 flex items-center justify-between bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded text-sm">
        <!-- Recipe meal (with link) -->
        <NuxtLink
          v-if="meal.recipeId"
          :to="`/recipes/${meal.recipeId}`"
          class="text-default hover:text-primary-600 flex-1"
        >
          {{ meal.recipeName }}
        </NuxtLink>
        <!-- Custom text meal (no link) -->
        <div v-else class="flex items-center gap-2 flex-1 text-default">
          <UIcon name="i-heroicons-pencil" class="text-muted w-4 h-4" />
          {{ meal.customText }}
        </div>
        <UButton
          icon="i-heroicons-x-mark"
          color="neutral"
          variant="ghost"
          size="xs"
          @click="handleRemoveMeal(meal.id)"
        />
      </div>

      <!-- Column 3: Add button (only on first row) -->
      <div class="w-8">
        <UButton
          v-if="meals.indexOf(meal) === 0"
          icon="i-heroicons-plus"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="openRecipeModal"
        />
      </div>
    </div>

    <!-- Empty state row (when no meals) -->
    <div v-if="meals.length === 0" class="flex items-center gap-3">
      <!-- Column 1: L/D label -->
      <div class="text-default font-medium w-6">
        {{ mealLabel }}
      </div>

      <!-- Column 2: Empty placeholder -->
      <div class="flex-1 text-muted text-sm">
        No meals
      </div>

      <!-- Column 3: Add button -->
      <div class="w-8">
        <UButton
          icon="i-heroicons-plus"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="openRecipeModal"
        />
      </div>
    </div>
  </div>
</template>
