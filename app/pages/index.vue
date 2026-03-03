<script setup lang="ts">
import type { RecipesResponse } from '~~/server/api/recipes/index.get';

// Fetch recipes from the API
const {
  data: recipesData,
  pending,
  error,
} = await useFetch<RecipesResponse>('/api/recipes');

const recipes = computed(() => recipesData.value?.recipes || []);

const search = ref('');

const filteredRecipes = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return recipes.value;
  return recipes.value.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.cuisine?.toLowerCase().includes(q),
  );
});
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center gap-4 mb-8">
      <h1 class="text-3xl font-bold">Recipes</h1>
      <UInput
        v-model="search"
        placeholder="Search recipes..."
        icon="i-lucide-search"
        class="flex-1 max-w-sm"
      />
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <div class="text-muted">Loading recipes...</div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-error py-12 text-center">
      <p>Failed to load recipes. Please try again later.</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="recipes.length === 0" class="text-muted py-12 text-center">
      <p>No recipes found.</p>
    </div>

    <!-- No search results -->
    <div v-else-if="filteredRecipes.length === 0" class="text-muted py-12 text-center">
      <p>No recipes match "{{ search }}".</p>
    </div>

    <!-- Recipe grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <RecipeCard v-for="recipe in filteredRecipes" :key="recipe.id" :recipe="recipe" />
    </div>
  </div>
</template>
