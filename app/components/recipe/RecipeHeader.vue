<script lang="ts" setup>
import DeleteRecipe from '~/components/recipe/DeleteRecipe.vue';
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

const { recipe } = defineProps<{
  recipe: GetRecipeByIdResponse;
}>();
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-start justify-between gap-4">
      <h1 class="text-4xl font-bold text-default">{{ recipe.name }}</h1>

      <DeleteRecipe :recipe-id="recipe.id" />
    </div>

    <div class="flex gap-4">
      <div
        v-if="recipe.cuisine"
        class="inline-block px-3 py-1 rounded-full text-sm font-medium w-fit bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
      >
        {{ recipe.cuisine }}
      </div>

      <a
        :href="recipe.sourceUrl"
        class="inline-block px-3 py-1 rounded-full text-sm font-medium w-fit bg-neutral-200 dark:bg-neutral-800 text-primary-800 dark:text-primary-200"
        target="_blank"
      >
        Visit 🔗
      </a>
    </div>
  </div>
</template>
