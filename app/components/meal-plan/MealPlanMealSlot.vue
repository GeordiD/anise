<script setup lang="ts">
import type { MealPlanMeal } from '~~/server/services/mealPlanService';
import MealPlanRecipeModal from './MealPlanRecipeModal.vue';
import MealPlanCustomTextModal from './MealPlanCustomTextModal.vue';

const props = defineProps<{
  dayId: number;
  mealType: 'lunch' | 'dinner';
  meals: MealPlanMeal[];
}>();

const mealLabel = computed(() => (props.mealType === 'lunch' ? 'L' : 'D'));

const overlay = useOverlay();
const recipeModal = overlay.create(MealPlanRecipeModal);
const customTextModal = overlay.create(MealPlanCustomTextModal);

function openRecipeModal() {
  recipeModal.open({
    dayId: props.dayId,
    mealType: props.mealType,
  });
}

function openCustomTextModal() {
  customTextModal.open({
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
  <div class="space-y-2">
    <div class="flex items-center gap-3">
      <div class="text-default font-medium w-6">
        {{ mealLabel }}
      </div>
      <div class="flex flex-1 gap-2">
        <UButton
          class="flex-1 justify-center"
          @click="openRecipeModal"
        >
          Add Recipe
        </UButton>
        <UButton
          class="flex-1 justify-center"
          variant="outline"
          @click="openCustomTextModal"
        >
          Add Text
        </UButton>
      </div>
    </div>

    <!-- Meal list -->
    <div v-if="meals.length > 0" class="ml-9 space-y-1">
      <div
        v-for="meal in meals"
        :key="meal.id"
        class="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded text-sm"
      >
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
    </div>
  </div>
</template>
