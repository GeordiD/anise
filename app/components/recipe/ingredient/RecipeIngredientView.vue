<script lang="ts" setup>
import { useElementHover } from '@vueuse/core';
import { useTemplateRef } from 'vue';
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

defineProps<{
  ingredient: GetRecipeByIdResponse['ingredients'][number]['items'][number];
}>();

defineEmits(['edit-clicked']);

const ingredientRef = useTemplateRef('ingredient');
const isHovered = useElementHover(ingredientRef);
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
      <UButton variant="ghost" color="error" icon="fe:trash" />
    </div>
  </li>
</template>

<style></style>
