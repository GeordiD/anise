<script lang="ts" setup>
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

defineProps<{
  ingredient: GetRecipeByIdResponse['ingredients'][number]['items'][number];
}>();

const isEditing = ref(false);
</script>

<template>
  <Fragment>
    <RecipeIngredientView
      v-if="!isEditing"
      :ingredient="ingredient"
      @edit-clicked="isEditing = true"
    />
    <RecipeIngredientEdit
      v-if="isEditing"
      :ingredient="ingredient"
      @close="isEditing = false"
    />
  </Fragment>
</template>

<style></style>
