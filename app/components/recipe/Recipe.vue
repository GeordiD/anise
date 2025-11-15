<script setup lang="ts">
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

defineProps<{
  recipe: GetRecipeByIdResponse;
}>();

const activeTab = ref<'ingredients' | 'instructions'>('ingredients');
</script>

<template>
  <div>
    <div class="flex flex-col gap-4 pb-4">
      <recipe-header :recipe="recipe" />

      <!-- Recipe tabs only visible on mobile -->
      <div class="lg:hidden">
        <recipe-tabs v-model="activeTab" />
      </div>

      <hr />

      <!-- Mobile: Tab-based layout -->
      <div class="flex flex-col lg:hidden">
        <recipe-ingredients
          v-if="activeTab === 'ingredients'"
          :recipe="recipe"
        />
        <div v-if="activeTab === 'instructions'" class="flex flex-col gap-4">
          <recipe-instructions :recipe="recipe" />
          <recipe-notes :recipe="recipe" />
        </div>
      </div>

      <!-- Desktop: Two-column layout -->
      <div class="hidden lg:grid lg:grid-cols-2 lg:gap-8">
        <recipe-ingredients :recipe="recipe" />
        <div class="flex flex-col gap-4">
          <recipe-instructions :recipe="recipe" />
          <recipe-notes :recipe="recipe" />
        </div>
      </div>
    </div>
  </div>
</template>
