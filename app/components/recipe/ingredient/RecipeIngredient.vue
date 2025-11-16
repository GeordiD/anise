<script lang="ts" setup>
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

defineProps<{
  ingredient: GetRecipeByIdResponse['ingredients'][number]['items'][number];
}>();
</script>

<template>
  <RecipeIngredientView :ingredient="ingredient" />
</template>

<style></style>
