<script lang="ts" setup>
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

defineProps<{
  ingredient: GetRecipeByIdResponse['ingredients'][number]['items'][number];
}>();

defineEmits(['close']);
</script>

<template>
  <div>
    <UButton @click="$emit('close')">Close</UButton>
  </div>
</template>

<style></style>
