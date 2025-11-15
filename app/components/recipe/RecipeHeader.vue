<script lang="ts" setup>
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

const { recipe } = defineProps<{
  recipe: GetRecipeByIdResponse;
}>();
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-4xl font-bold text-default">{{ recipe.name }}</h1>

    <div class="flex gap-4">
      <div
        v-if="recipe.cuisine"
        class="inline-block px-3 py-1 rounded-full text-sm font-medium w-fit bg-basil-100 text-basil-400"
      >
        {{ recipe.cuisine }}
      </div>
    </div>
  </div>
</template>
