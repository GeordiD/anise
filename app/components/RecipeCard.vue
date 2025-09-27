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
        class="text-xl font-semibold mb-3 text-default hover:text-primary-600"
      >
        {{ recipe.name }}
      </h2>

      <div class="space-y-2 text-sm text-muted">
        <div v-if="recipe.cuisine" class="flex items-center">
          <span class="font-medium">Cuisine:</span>
          <span class="ml-2">{{ recipe.cuisine }}</span>
        </div>
      </div>

      <div class="mt-4 text-primary-600 text-sm font-medium">View Recipe →</div>
    </NuxtLink>
  </UCard>
</template>

<style></style>
