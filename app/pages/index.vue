<script setup lang="ts">
import type { RecipesResponse } from '~~/server/api/recipes/index.get';

// Fetch recipes from the API
const {
  data: recipesData,
  pending,
  error,
} = await useFetch<RecipesResponse>('/api/recipes');

const recipes = computed(() => recipesData.value?.recipes || []);
</script>

<template>
  <div class="max-w-6xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-8">Recipes</h1>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <div class="text-gray-600 dark:text-gray-400">Loading recipes...</div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-red-600 dark:text-red-400 py-12 text-center">
      <p>Failed to load recipes. Please try again later.</p>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="recipes.length === 0"
      class="text-gray-600 dark:text-gray-400 py-12 text-center"
    >
      <p>No recipes found.</p>
    </div>

    <!-- Recipe grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <RecipeCard v-for="recipe in recipes" :key="recipe.id" :recipe="recipe" />
    </div>
  </div>
</template>
