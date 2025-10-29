<script lang="ts" setup>
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

defineProps<{
  ingredient: GetRecipeByIdResponse['ingredients'][number]['items'][number];
}>();

const emit = defineEmits<{
  ingredientUpdated: [ingredientId: number];
}>();

const isEditing = ref(false);

const handleSaved = (ingredientId: number) => {
  isEditing.value = false;
  emit('ingredientUpdated', ingredientId);
};
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
      @saved="handleSaved"
    />
  </Fragment>
</template>

<style></style>
