<script lang="ts" setup>
import type { Recipe } from '~~/server/services/recipeService';

const { recipe } = defineProps<{
  recipe: Recipe;
}>();
</script>

<template>
  <UCard class="hover:shadow-lg transition-shadow cursor-pointer">
    <NuxtLink :to="`/recipes/${recipe.id}`" class="block">
      <h2
        class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
      >
        {{ recipe.name }}
      </h2>

      <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <div v-if="recipe.cuisine" class="flex items-center">
          <span class="font-medium">Cuisine:</span>
          <span class="ml-2">{{ recipe.cuisine }}</span>
        </div>
      </div>

      <div
        class="mt-4 text-primary-600 dark:text-primary-400 text-sm font-medium"
      >
        View Recipe →
      </div>
    </NuxtLink>
  </UCard>
</template>

<style></style>
