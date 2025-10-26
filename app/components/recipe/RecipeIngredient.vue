<script lang="ts" setup>
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

defineProps<{
  ingredient: GetRecipeByIdResponse['ingredients'][number]['items'][number];
}>();
</script>

<template>
  <li class="flex items-start">
    <span
      class="text-primary-600 dark:text-primary-400 mr-2 mt-2.5 w-1 h-1 bg-current rounded-full flex-shrink-0"
    />
    <span
      :class="{
        'line-through': ingredient.isUnused,
        'text-primary-700 dark:text-primary-300': ingredient.isSubstituted,
      }"
      >{{ ingredient.name }}</span
    >
  </li>
</template>

<style></style>
