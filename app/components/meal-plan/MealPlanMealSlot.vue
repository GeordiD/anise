<script setup lang="ts">
import type { MealPlanMeal } from '~~/server/services/mealPlanService';
import MealPlanRecipeModal from './MealPlanRecipeModal.vue';

const props = defineProps<{
  dayId: number;
  mealType: 'lunch' | 'dinner';
  meals: MealPlanMeal[];
}>();

const emit = defineEmits<{
  selectMeals: [
    dayId: number,
    mealType: 'lunch' | 'dinner',
    recipeIds: number[]
  ];
  removeMeal: [mealId: number];
}>();

const mealLabel = computed(() => (props.mealType === 'lunch' ? 'L' : 'D'));

const overlay = useOverlay();
const modal = overlay.create(MealPlanRecipeModal);
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center gap-3">
      <div class="text-default font-medium w-6">
        {{ mealLabel }}
      </div>
      <UButton
        color="neutral"
        variant="outline"
        class="flex-1 justify-start"
        @click="
          () => {
            modal.open({
              onSelect: (recipeIds) => {
                emit('selectMeals', dayId, mealType, recipeIds);
                modal.close();
              },
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
        class="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-sm"
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
          @click="emit('removeMeal', meal.id)"
        />
      </div>
    </div>
  </div>
</template>
