<script lang="ts" setup>
import { useElementHover } from '@vueuse/core';
import { useTemplateRef } from 'vue';
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';
import type { UpdateIngredientResponse } from '~~/server/api/ingredients/[id].patch';

const { ingredient } = defineProps<{
  ingredient: GetRecipeByIdResponse['ingredients'][number]['items'][number];
}>();

defineEmits(['edit-clicked']);

const route = useRoute();
const recipeId = route.params.id as string;

const ingredientRef = useTemplateRef('ingredient');
const isHovered = useElementHover(ingredientRef);
const isDeleting = ref(false);

const handleDelete = async () => {
  isDeleting.value = true;

  try {
    await $fetch<UpdateIngredientResponse>(
      `/api/ingredients/${ingredient.id}`,
      {
        method: 'PATCH',
        body: {
          doNotUse: !ingredient.isUnused,
        },
      }
    );

    // Refresh the recipe data using Nuxt's cache invalidation
    await refreshNuxtData(`recipe-${recipeId}`);
  } catch (error: unknown) {
    const err = error as { data?: { statusMessage?: string } };
    console.error(
      'Failed to toggle do not use:',
      err?.data?.statusMessage || 'Unknown error'
    );
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <li ref="ingredient" class="flex justify-between min-h-8">
    <div class="flex items-start">
     
      <span
        :class="{
          'line-through': ingredient.isUnused,
          'text-primary-700 dark:text-primary-300': ingredient.isSubstituted,
        }"
        >{{ ingredient.name }}</span
      >
    </div>

    <div v-if="isHovered" class="shrink-0">
      <UButton variant="ghost" icon="fe:edit" @click="$emit('edit-clicked')" />
      <UButton
        variant="ghost"
        color="error"
        icon="fe:trash"
        :loading="isDeleting"
        :disabled="isDeleting"
        @click="handleDelete"
      />
    </div>
  </li>
</template>

<style></style>
