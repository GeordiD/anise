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
      if (meal.recipeId) {
        recipeIds.add(meal.recipeId);
      }
    }
  }

  return Array.from(recipeIds);
});

// Extract custom text meals from the meal plan
type CustomMeal = {
  mealId: number;
  text: string;
};

const customMeals = computed(() => {
  if (!mealPlan.value) return [];

  const meals: CustomMeal[] = [];

  for (const day of mealPlan.value.days) {
    for (const meal of [...day.lunch, ...day.dinner]) {
      if (meal.customText && !meal.recipeId) {
        meals.push({
          mealId: meal.id,
          text: meal.customText,
        });
      }
    }
  }

  return meals;
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

// Type for custom meal step with manually added ingredients
type CustomMealStep = {
  mealId: number;
  name: string;
  ingredients: SelectableIngredient[];
  nextIngredientId: number;
};

// Fetch all unique recipes with their ingredients
const recipes = ref<RecipeWithIngredients[]>([]);
const customMealSteps = ref<CustomMealStep[]>([]);
const recipesLoading = ref(true);
const recipesError = ref<string | null>(null);

// Total steps = recipes + custom meals
const totalSteps = computed(() => recipes.value.length + customMealSteps.value.length);

// Current step in the wizard (0-indexed)
const currentStep = ref(0);

// Determine if current step is a recipe or custom meal
const isRecipeStep = computed(() => currentStep.value < recipes.value.length);
const currentRecipe = computed(() =>
  isRecipeStep.value ? recipes.value[currentStep.value] : null
);
const currentCustomMeal = computed(() =>
  !isRecipeStep.value
    ? customMealSteps.value[currentStep.value - recipes.value.length]
    : null
);

const isFirstStep = computed(() => currentStep.value === 0);
const isLastStep = computed(() => currentStep.value === totalSteps.value - 1);

// Check if there are any items to show
const hasItems = computed(() => totalSteps.value > 0);

// Navigate to previous step
function goBack() {
  if (!isFirstStep.value) {
    currentStep.value--;
  }
}

// Navigate to next step or finish
async function goNext() {
  if (isLastStep.value) {
    await finish();
  } else {
    currentStep.value++;
  }
}

// Toggle ingredient selection for recipe
function toggleIngredient(ingredientId: number) {
  if (!currentRecipe.value) return;

  const ingredient = currentRecipe.value.ingredients.find(i => i.id === ingredientId);
  if (ingredient) {
    ingredient.selected = !ingredient.selected;
  }
}

// Update ingredient text for recipe
function updateIngredientText(ingredientId: number, newText: string) {
  if (!currentRecipe.value) return;

  const ingredient = currentRecipe.value.ingredients.find(i => i.id === ingredientId);
  if (ingredient) {
    ingredient.text = newText;
  }
}

// Toggle ingredient selection for custom meal
function toggleCustomIngredient(ingredientId: number) {
  if (!currentCustomMeal.value) return;

  const ingredient = currentCustomMeal.value.ingredients.find(i => i.id === ingredientId);
  if (ingredient) {
    ingredient.selected = !ingredient.selected;
  }
}

// Add new ingredient to current custom meal
function addCustomIngredient() {
  if (!currentCustomMeal.value) return;

  currentCustomMeal.value.ingredients.push({
    id: currentCustomMeal.value.nextIngredientId++,
    text: '',
    selected: true,
  });
}

// Remove ingredient from current custom meal
function removeCustomIngredient(ingredientId: number) {
  if (!currentCustomMeal.value) return;

  const index = currentCustomMeal.value.ingredients.findIndex(i => i.id === ingredientId);
  if (index > -1) {
    currentCustomMeal.value.ingredients.splice(index, 1);
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

    // Collect all ingredients from custom meals
    for (const customMeal of customMealSteps.value) {
      for (const ingredient of customMeal.ingredients) {
        if (ingredient.selected && ingredient.text.trim()) {
          selectedItems.push({
            recipeId: null,
            mealId: customMeal.mealId,
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
  // Initialize custom meal steps
  customMealSteps.value = customMeals.value.map(meal => ({
    mealId: meal.mealId,
    name: meal.text,
    ingredients: [],
    nextIngredientId: 1,
  }));

  if (!uniqueRecipeIds.value.length && !customMeals.value.length) {
    recipesLoading.value = false;
    return;
  }

  try {
    if (uniqueRecipeIds.value.length > 0) {
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
    }

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
      <div v-else-if="!mealPlan || !hasItems" class="flex flex-col items-center justify-center py-12 text-center">
        <p class="text-muted text-lg mb-4">No meals in your meal plan</p>
        <UButton
          to="/meal-plan"
          color="primary"
        >
          Go to Meal Plan
        </UButton>
      </div>

      <!-- Recipe step content -->
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
          Step {{ currentStep + 1 }} of {{ totalSteps }}
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

      <!-- Custom meal step content -->
      <div v-else-if="currentCustomMeal" class="space-y-6">
        <!-- Custom meal title and subtitle -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-pencil" class="text-muted w-5 h-5" />
            <h2 class="text-2xl font-bold text-default">
              {{ currentCustomMeal.name }}
            </h2>
          </div>
          <p class="text-muted">
            Add any ingredients you need for this meal
          </p>
        </div>

        <!-- Progress indicator -->
        <div class="text-sm text-muted">
          Step {{ currentStep + 1 }} of {{ totalSteps }}
        </div>

        <!-- Add ingredient button -->
        <UButton
          icon="i-heroicons-plus"
          color="neutral"
          variant="outline"
          @click="addCustomIngredient"
        >
          Add Ingredient
        </UButton>

        <!-- Ingredients list -->
        <div class="space-y-3">
          <div
            v-for="ingredient in currentCustomMeal.ingredients"
            :key="ingredient.id"
            class="flex items-start gap-3"
          >
            <!-- Checkbox -->
            <UCheckbox
              :model-value="ingredient.selected"
              class="mt-2.5"
              @update:model-value="toggleCustomIngredient(ingredient.id)"
            />

            <!-- Editable text input -->
            <div class="flex-1">
              <UInput
                v-model="ingredient.text"
                class="w-full"
                placeholder="Enter ingredient..."
              />
            </div>

            <!-- Delete button -->
            <UButton
              icon="i-heroicons-trash"
              color="neutral"
              variant="ghost"
              size="sm"
              class="mt-1"
              @click="removeCustomIngredient(ingredient.id)"
            />
          </div>

          <!-- Empty state -->
          <div
            v-if="currentCustomMeal.ingredients.length === 0"
            class="text-center py-8 text-muted"
          >
            No ingredients added yet. Click "Add Ingredient" to add items.
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
          :disabled="submitting || recipesLoading || !hasItems"
          :loading="submitting"
          @click="goNext"
        >
          {{ isLastStep ? 'Finish' : 'Next' }}
        </UButton>
      </div>
    </footer>
  </div>
</template>
