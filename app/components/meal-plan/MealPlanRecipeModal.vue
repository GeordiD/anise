<script setup lang="ts">
import type { RecipesResponse } from '~~/server/api/recipes/index.get';

const emit = defineEmits<{
  select: [recipeIds: number[]];
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

function handleSelect() {
  console.log('here2');
  emit('select', selectedRecipeIds.value);
  selectedRecipeIds.value = [];
  searchQuery.value = '';
}

function handleClose() {
  selectedRecipeIds.value = [];
  searchQuery.value = '';
}
</script>

<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    @after:leave="handleClose"
  >
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
            <div
              v-for="recipe in filteredRecipes"
              :key="recipe.id"
              class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              @click="toggleRecipe(recipe.id)"
            >
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
            <UButton color="neutral" variant="ghost" @click="handleClose">
              Cancel
            </UButton>
            <UButton
              color="primary"
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
