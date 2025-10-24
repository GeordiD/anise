<script lang="ts" setup>
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

defineProps<{
  recipe: GetRecipeByIdResponse;
}>();
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-default mb-4">Instructions</h2>
    <ol class="space-y-4">
      <li
        v-for="(instruction, index) in recipe.instructions"
        :key="index"
        class="flex items-start"
      >
        <span
          class="bg-primary-600 dark:bg-primary-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0"
        >
          {{ index + 1 }}
        </span>
        <span class="text-toned leading-relaxed">{{ instruction }}</span>
      </li>
    </ol>
  </div>
</template>

<style></style>
