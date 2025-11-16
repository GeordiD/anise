<script lang="ts" setup>
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

const { ingredient } = defineProps<{
  ingredient: GetRecipeByIdResponse['ingredients'][number]['items'][number];
}>();
</script>

<template>
  <li class="flex items-start min-h-8">
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
