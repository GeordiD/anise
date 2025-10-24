<script lang="ts" setup>
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

defineProps<{
  recipe: GetRecipeByIdResponse;
}>();
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-4xl font-bold text-default">{{ recipe.name }}</h1>

    <div
      v-if="recipe.cuisine"
      class="inline-block bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm font-medium"
    >
      {{ recipe.cuisine }}
    </div>
  </div>
</template>

<style></style>
