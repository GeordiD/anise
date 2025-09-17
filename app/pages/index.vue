<script setup lang="ts">
interface Recipe {
  id: number
  name: string
  prepTime: string | null
  cookTime: string | null
  totalTime: string | null
  servings: string | null
  cuisine: string | null
}

interface RecipesResponse {
  success: boolean
  recipes: Recipe[]
}

// Fetch recipes from the API
const { data: recipesData, pending, error } = await useFetch<RecipesResponse>('/api/recipes')

const recipes = computed(() => recipesData.value?.recipes || [])
</script>

<template>
  <div class="max-w-6xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-8">Recipes</h1>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <div class="text-gray-600">Loading recipes...</div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-red-600 py-12 text-center">
      <p>Failed to load recipes. Please try again later.</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="recipes.length === 0" class="text-gray-600 py-12 text-center">
      <p>No recipes found.</p>
    </div>

    <!-- Recipe grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="recipe in recipes"
        :key="recipe.id"
        class="hover:shadow-lg transition-shadow cursor-pointer"
      >
        <NuxtLink :to="`/recipes/${recipe.id}`" class="block">
          <h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400">
            {{ recipe.name }}
          </h2>

          <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div v-if="recipe.cuisine" class="flex items-center">
              <span class="font-medium">Cuisine:</span>
              <span class="ml-2">{{ recipe.cuisine }}</span>
            </div>

            <div v-if="recipe.totalTime" class="flex items-center">
              <span class="font-medium">Total Time:</span>
              <span class="ml-2">{{ recipe.totalTime }}</span>
            </div>

            <div v-if="recipe.servings" class="flex items-center">
              <span class="font-medium">Servings:</span>
              <span class="ml-2">{{ recipe.servings }}</span>
            </div>

            <div v-if="recipe.prepTime || recipe.cookTime" class="flex items-center space-x-4">
              <div v-if="recipe.prepTime" class="flex items-center">
                <span class="font-medium">Prep:</span>
                <span class="ml-1">{{ recipe.prepTime }}</span>
              </div>
              <div v-if="recipe.cookTime" class="flex items-center">
                <span class="font-medium">Cook:</span>
                <span class="ml-1">{{ recipe.cookTime }}</span>
              </div>
            </div>
          </div>

          <div class="mt-4 text-primary-600 dark:text-primary-400 text-sm font-medium">
            View Recipe →
          </div>
        </NuxtLink>
      </UCard>
    </div>
  </div>
</template>