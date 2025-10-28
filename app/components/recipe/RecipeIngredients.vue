<script lang="ts" setup>
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

defineProps<{
  recipe: GetRecipeByIdResponse;
}>();
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-default mb-4">Ingredients</h2>
    <div class="space-y-6">
      <div
        v-for="(group, index) in recipe.ingredients"
        :key="index"
        class="space-y-2"
      >
        <h3
          v-if="group.name"
          class="text-lg font-semibold text-toned border-b border-neutral-200 dark:border-neutral-700 pb-1"
        >
          {{ group.name }}
        </h3>
        <ul class="flex flex-col gap-2">
          <recipe-ingredient
            v-for="(ingredient, itemIndex) in group.items"
            :key="itemIndex"
            :ingredient="ingredient"
          />
        </ul>
      </div>
    </div>
  </div>
</template>

<style></style>
