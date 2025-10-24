<script setup lang="ts">
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

defineProps<{
  recipe: GetRecipeByIdResponse;
}>();

const activeTab = ref<'ingredients' | 'instructions'>('ingredients');
</script>

<template>
  <div>
    <div class="flex flex-col gap-4 pb-16">
      <recipe-header :recipe="recipe" />

      <hr />

      <recipe-ingredients v-if="activeTab === 'ingredients'" :recipe="recipe" />

      <recipe-instructions
        v-if="activeTab === 'instructions'"
        :recipe="recipe"
      />

      <recipe-notes :recipe="recipe" />
    </div>
    <recipe-bottom-nav v-model="activeTab" />
  </div>
</template>
