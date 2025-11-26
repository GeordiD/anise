<script setup lang="ts">
import type { RecipesResponse } from '~~/server/api/recipes/index.get';
import type { AddMealRequest } from '~~/server/api/meal-plan/meals.post';

const props = defineProps<{
  dayId: number;
  mealType: 'lunch' | 'dinner';
}>();

const emit = defineEmits<{
  close: [isSave: boolean];
}>();

// Fetch all recipes
const { data: recipesData } = await useFetch<RecipesResponse>('/api/recipes');
const recipes = computed(() => recipesData.value?.recipes || []);

// Search functionality
const searchQuery = ref('');
const filteredRecipes = computed(() => {
  if (!searchQuery.value) {
    return recipes.value;
  }
  const query = searchQuery.value.toLowerCase();
  return recipes.value.filter((recipe) =>
    recipe.name.toLowerCase().includes(query)
  );
});

// Selected recipes tracking
const selectedRecipeIds = ref<number[]>([]);

function toggleRecipe(recipeId: number) {
  const index = selectedRecipeIds.value.indexOf(recipeId);
  if (index > -1) {
    selectedRecipeIds.value.splice(index, 1);
  } else {
    selectedRecipeIds.value.push(recipeId);
  }
}

async function handleSelect() {
  try {
    // Add each selected recipe
    for (const recipeId of selectedRecipeIds.value) {
      const payload: AddMealRequest = {
        dayId: props.dayId,
        mealType: props.mealType,
        recipeId,
      };

      await $fetch('/api/meal-plan/meals', {
        method: 'POST',
        body: payload,
      });
    }

    // Refresh the meal plan data using Nuxt's cache invalidation
    await refreshNuxtData('meal-plan');

    emit('close', true);
  } catch (err) {
    console.error('Failed to add recipes:', err);
    // TODO: Show error toast
  }
}

function handleClose() {
  emit('close', false);
}

function resetState() {
  selectedRecipeIds.value = [];
  searchQuery.value = '';
}
</script>

<template>
  <UModal :close="{ onClick: handleClose }" @after:leave="resetState">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-default">Select Recipes</h3>
            <UButton
              icon="i-heroicons-x-mark"
              color="neutral"
              variant="ghost"
              @click="handleClose"
            />
          </div>
        </template>

        <div class="space-y-4">
          <!-- Search bar -->
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Search recipes..."
            class="w-full"
          />

          <!-- Recipe list -->
          <div class="max-h-96 overflow-y-auto space-y-2">
            <UCard
              v-for="recipe in filteredRecipes"
              :key="recipe.id"
              class="cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              @click="toggleRecipe(recipe.id)"
            >
              <div class="flex items-center gap-3">
                <UCheckbox
                  :model-value="selectedRecipeIds.includes(recipe.id)"
                  @update:model-value="toggleRecipe(recipe.id)"
                />
                <div class="flex-1">
                  <div class="font-medium text-default">
                    {{ recipe.name }}
                  </div>
                  <div v-if="recipe.cuisine" class="text-sm text-muted">
                    {{ recipe.cuisine }}
                  </div>
                </div>
              </div>
            </UCard>

            <!-- Empty state -->
            <div
              v-if="filteredRecipes.length === 0"
              class="text-center py-8 text-muted"
            >
              No recipes found
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton 
              @click="handleClose">
              Cancel
            </UButton>
            <UButton
              color="primary"
              variant="solid"
              size="md"
              :disabled="selectedRecipeIds.length === 0"
              @click="handleSelect"
            >
              Add
              {{
                selectedRecipeIds.length > 0
                  ? `(${selectedRecipeIds.length})`
                  : ''
              }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
