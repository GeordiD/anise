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
const modal = overlay.create(MealPlanRecipeModal);

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
  <div class="space-y-2">
    <div class="flex items-center gap-3">
      <div class="text-default font-medium w-6">
        {{ mealLabel }}
      </div>
      <UButton
        class="flex-1 justify-start"
        @click="
          () => {
            modal.open({
              dayId,
              mealType,
            });
          }
        "
      >
        Add Recipe
      </UButton>
    </div>

    <!-- Recipe list -->
    <div v-if="meals.length > 0" class="ml-9 space-y-1">
      <div
        v-for="meal in meals"
        :key="meal.id"
        class="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded text-sm"
      >
        <NuxtLink
          :to="`/recipes/${meal.recipeId}`"
          class="text-default hover:text-primary-600 flex-1"
        >
          {{ meal.recipeName }}
        </NuxtLink>
        <UButton
          icon="i-heroicons-x-mark"
          color="neutral"
          variant="ghost"
          size="xs"
          @click="handleRemoveMeal(meal.id)"
        />
      </div>
    </div>
  </div>
</template>
