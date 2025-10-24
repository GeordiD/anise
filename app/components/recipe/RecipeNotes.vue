<script lang="ts" setup>
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

defineProps<{
  recipe: GetRecipeByIdResponse;
}>();
</script>

<template>
  <div
    v-if="recipe.notes && recipe.notes.length > 0"
    class="border-t border-neutral-200 dark:border-neutral-700 pt-4"
  >
    <h2 class="text-2xl font-bold text-default mb-4">Notes</h2>
    <div
      class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4"
    >
      <ul class="space-y-2">
        <li
          v-for="(note, index) in recipe.notes"
          :key="index"
          class="flex items-start"
        >
          <span
            class="text-yellow-600 dark:text-yellow-400 mr-2 mt-1.5 w-1 h-1 bg-current rounded-full flex-shrink-0"
          />
          <span class="text-toned">{{ note }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style></style>
