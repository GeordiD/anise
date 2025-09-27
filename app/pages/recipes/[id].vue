<script setup lang="ts">
interface IngredientGroup {
  name: string | null
  items: string[]
}

interface Recipe {
  id: number
  name: string
  prepTime: string | null
  cookTime: string | null
  totalTime: string | null
  servings: string | null
  cuisine: string | null
  ingredients: IngredientGroup[]
  instructions: string[]
  notes: string[]
}

const route = useRoute()
const id = route.params.id as string

// Fetch recipe details from the API
const { data: recipe, pending, error } = await useFetch<Recipe>(`/api/recipes/${id}`)
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <div class="text-muted">Loading recipe...</div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-error mb-4">
        <p>Recipe not found or failed to load.</p>
      </div>
      <NuxtLink to="/" class="text-primary hover:text-primary font-medium">
        ← Back to Recipes
      </NuxtLink>
    </div>

    <!-- Recipe content -->
    <div v-else-if="recipe" class="space-y-8">
      <!-- Header with back button -->
      <div class="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-4">
        <NuxtLink to="/" class="text-primary hover:text-primary font-medium flex items-center">
          ← Back to Recipes
        </NuxtLink>
      </div>

      <!-- Recipe title and meta info -->
      <div class="space-y-4">
        <h1 class="text-4xl font-bold text-default">{{ recipe.name }}</h1>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div v-if="recipe.prepTime" class="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
            <span class="font-medium text-toned">Prep Time</span>
            <p class="text-default">{{ recipe.prepTime }}</p>
          </div>
          <div v-if="recipe.cookTime" class="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
            <span class="font-medium text-toned">Cook Time</span>
            <p class="text-default">{{ recipe.cookTime }}</p>
          </div>
          <div v-if="recipe.totalTime" class="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
            <span class="font-medium text-toned">Total Time</span>
            <p class="text-default">{{ recipe.totalTime }}</p>
          </div>
          <div v-if="recipe.servings" class="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
            <span class="font-medium text-toned">Servings</span>
            <p class="text-default">{{ recipe.servings }}</p>
          </div>
        </div>

        <div v-if="recipe.cuisine" class="inline-block bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm font-medium">
          {{ recipe.cuisine }}
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Ingredients -->
        <div>
          <h2 class="text-2xl font-bold text-default mb-4">Ingredients</h2>
          <div class="space-y-6">
            <div v-for="(group, index) in recipe.ingredients" :key="index" class="space-y-2">
              <h3 v-if="group.name" class="text-lg font-semibold text-toned border-b border-neutral-200 dark:border-neutral-700 pb-1">
                {{ group.name }}
              </h3>
              <ul class="space-y-1">
                <li v-for="(ingredient, itemIndex) in group.items" :key="itemIndex" class="flex items-start">
                  <span class="text-primary-600 dark:text-primary-400 mr-2 mt-1.5 w-1 h-1 bg-current rounded-full flex-shrink-0" />
                  <span class="text-toned">{{ ingredient }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div>
          <h2 class="text-2xl font-bold text-default mb-4">Instructions</h2>
          <ol class="space-y-4">
            <li v-for="(instruction, index) in recipe.instructions" :key="index" class="flex items-start">
              <span class="bg-primary-600 dark:bg-primary-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                {{ index + 1 }}
              </span>
              <span class="text-toned leading-relaxed">{{ instruction }}</span>
            </li>
          </ol>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="recipe.notes && recipe.notes.length > 0" class="border-t border-neutral-200 dark:border-neutral-700 pt-8">
        <h2 class="text-2xl font-bold text-default mb-4">Notes</h2>
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <ul class="space-y-2">
            <li v-for="(note, index) in recipe.notes" :key="index" class="flex items-start">
              <span class="text-yellow-600 dark:text-yellow-400 mr-2 mt-1.5 w-1 h-1 bg-current rounded-full flex-shrink-0" />
              <span class="text-toned">{{ note }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>