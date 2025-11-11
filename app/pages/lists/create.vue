<script setup lang="ts">
import type { MealPlanResponse } from '~~/server/api/meal-plan/index.get';
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';
import type { AddItemsRequest } from '~~/server/api/shopping-list/index.post';

definePageMeta({
  title: 'Select Ingredients',
});

// Fetch meal plan data with all recipes
const {
  data: mealPlanData,
  pending,
  error,
} = await useFetch<MealPlanResponse>('/api/meal-plan');

const mealPlan = computed(() => mealPlanData.value?.mealPlan);

// Extract unique recipe IDs from the meal plan
const uniqueRecipeIds = computed(() => {
  if (!mealPlan.value) return [];

  const recipeIds = new Set<number>();

  for (const day of mealPlan.value.days) {
    for (const meal of [...day.lunch, ...day.dinner]) {
      recipeIds.add(meal.recipeId);
    }
  }

  return Array.from(recipeIds);
});

// Type for ingredient with selection state
type SelectableIngredient = {
  id: number;
  text: string;
  selected: boolean;
};

type RecipeWithIngredients = {
  id: number;
  name: string;
  ingredients: SelectableIngredient[];
};

// Fetch all unique recipes with their ingredients
const recipes = ref<RecipeWithIngredients[]>([]);
const recipesLoading = ref(true);
const recipesError = ref<string | null>(null);

// Current step in the wizard (0-indexed)
const currentStep = ref(0);
const currentRecipe = computed(() => recipes.value[currentStep.value]);
const isFirstStep = computed(() => currentStep.value === 0);
const isLastStep = computed(() => currentStep.value === recipes.value.length - 1);

// Navigate to previous recipe
function goBack() {
  if (!isFirstStep.value) {
    currentStep.value--;
  }
}

// Navigate to next recipe or finish
async function goNext() {
  if (isLastStep.value) {
    await finish();
  } else {
    currentStep.value++;
  }
}

// Toggle ingredient selection
function toggleIngredient(ingredientId: number) {
  if (!currentRecipe.value) return;

  const ingredient = currentRecipe.value.ingredients.find(i => i.id === ingredientId);
  if (ingredient) {
    ingredient.selected = !ingredient.selected;
  }
}

// Update ingredient text
function updateIngredientText(ingredientId: number, newText: string) {
  if (!currentRecipe.value) return;

  const ingredient = currentRecipe.value.ingredients.find(i => i.id === ingredientId);
  if (ingredient) {
    ingredient.text = newText;
  }
}

// Submitting state
const submitting = ref(false);

// Finish wizard and submit selected ingredients
async function finish() {
  submitting.value = true;

  try {
    // Collect all selected ingredients across all recipes
    const selectedItems: AddItemsRequest['items'] = [];

    for (const recipe of recipes.value) {
      for (const ingredient of recipe.ingredients) {
        if (ingredient.selected) {
          selectedItems.push({
            recipeId: recipe.id,
            ingredientText: ingredient.text,
          });
        }
      }
    }

    // Submit to API
    if (selectedItems.length > 0) {
      await $fetch('/api/shopping-list', {
        method: 'POST',
        body: {
          items: selectedItems,
        } as AddItemsRequest,
      });
    }

    // Navigate to shopping list
    await navigateTo('/lists');
  } catch (err) {
    console.error('Failed to create shopping list:', err);
    // TODO: Show error toast
    submitting.value = false;
  }
}

// Load all recipes on mount
onMounted(async () => {
  if (!uniqueRecipeIds.value.length) {
    recipesLoading.value = false;
    return;
  }

  try {
    // Fetch all recipes in parallel
    const recipePromises = uniqueRecipeIds.value.map(id =>
      $fetch<GetRecipeByIdResponse>(`/api/recipes/${id}`)
    );

    const fetchedRecipes = await Promise.all(recipePromises);

    // Transform recipes into selectable format
    recipes.value = fetchedRecipes.map(recipe => ({
      id: recipe.id,
      name: recipe.name,
      ingredients: recipe.ingredients.flatMap(group =>
        group.items
          .filter(item => !item.isUnused) // Filter out doNotUse ingredients
          .map(item => ({
            id: item.id,
            text: item.name || '',
            selected: false,
          }))
      ),
    }));

    recipesLoading.value = false;
  } catch (err) {
    console.error('Failed to load recipes:', err);
    recipesError.value = 'Failed to load recipes. Please try again.';
    recipesLoading.value = false;
  }
});
</script>

<template>
  <div class="flex flex-col h-screen max-w-[414px] mx-auto">
    <!-- Sticky Header -->
    <header class="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4">
      <h1 class="text-2xl font-bold text-default">Select Ingredients</h1>
    </header>

    <!-- Main Content - Scrollable -->
    <main class="flex-1 overflow-y-auto px-4 py-6">
      <!-- Loading state -->
      <div v-if="pending || recipesLoading" class="flex justify-center py-12">
        <div class="text-muted">Loading recipes...</div>
      </div>

      <!-- Error state -->
      <div v-else-if="error || recipesError" class="text-error py-12 text-center">
        <p>{{ recipesError || 'Failed to load meal plan. Please try again later.' }}</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="!mealPlan || uniqueRecipeIds.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
        <p class="text-muted text-lg mb-4">No recipes in your meal plan</p>
        <UButton
          to="/meal-plan"
          color="primary"
        >
          Go to Meal Plan
        </UButton>
      </div>

      <!-- Recipe wizard content -->
      <div v-else-if="currentRecipe" class="space-y-6">
        <!-- Recipe title and subtitle -->
        <div class="space-y-2">
          <h2 class="text-2xl font-bold text-default">
            {{ currentRecipe.name }}
          </h2>
          <p class="text-muted">
            Select ingredients to add to list
          </p>
        </div>

        <!-- Progress indicator -->
        <div class="text-sm text-muted">
          Recipe {{ currentStep + 1 }} of {{ recipes.length }}
        </div>

        <!-- Ingredients list -->
        <div class="space-y-3">
          <div
            v-for="ingredient in currentRecipe.ingredients"
            :key="ingredient.id"
            class="flex items-start gap-3"
          >
            <!-- Checkbox -->
            <UCheckbox
              :model-value="ingredient.selected"
              class="mt-2.5"
              @update:model-value="toggleIngredient(ingredient.id)"
            />

            <!-- Editable text input -->
            <div class="flex-1">
              <UInput
                :model-value="ingredient.text"
                class="w-full"
                @update:model-value="(value: string) => updateIngredientText(ingredient.id, value)"
              />
            </div>
          </div>

          <!-- Empty state for no ingredients -->
          <div
            v-if="currentRecipe.ingredients.length === 0"
            class="text-center py-8 text-muted"
          >
            No ingredients available for this recipe
          </div>
        </div>
      </div>
    </main>

    <!-- Fixed Footer with navigation buttons -->
    <footer class="sticky bottom-0 z-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-4">
      <div class="flex gap-3">
        <!-- Back button (hidden on first step) -->
        <UButton
          v-if="!isFirstStep"
          color="neutral"
          variant="outline"
          size="lg"
          class="flex-1"
          :disabled="submitting"
          @click="goBack"
        >
          Back
        </UButton>

        <!-- Next/Finish button -->
        <UButton
          color="primary"
          size="lg"
          :class="isFirstStep ? 'w-full' : 'flex-1'"
          :disabled="submitting || recipesLoading || !currentRecipe"
          :loading="submitting"
          @click="goNext"
        >
          {{ isLastStep ? 'Finish' : 'Next' }}
        </UButton>
      </div>
    </footer>
  </div>
</template>
