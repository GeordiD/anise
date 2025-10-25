<script setup lang="ts">
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

defineProps<{
  recipe: GetRecipeByIdResponse;
}>();

const activeTab = ref<'ingredients' | 'instructions'>('ingredients');
</script>

<template>
  <div>
    <div class="flex flex-col gap-4 pb-16 lg:pb-4">
      <recipe-header :recipe="recipe" />

      <hr />

      <!-- Mobile: Tab-based layout -->
      <div class="lg:hidden">
        <recipe-ingredients v-if="activeTab === 'ingredients'" :recipe="recipe" />
        <recipe-instructions
          v-if="activeTab === 'instructions'"
          :recipe="recipe"
        />
      </div>

      <!-- Desktop: Two-column layout -->
      <div class="hidden lg:grid lg:grid-cols-2 lg:gap-8">
        <recipe-ingredients :recipe="recipe" />
        <div class="flex flex-col gap-4">
          <recipe-instructions :recipe="recipe" />
          <recipe-notes :recipe="recipe" />
        </div>
      </div>

      <!-- Mobile: Notes at bottom -->
      <div class="lg:hidden">
        <recipe-notes :recipe="recipe" />
      </div>
    </div>
    <!-- Bottom nav only visible on mobile -->
    <div class="lg:hidden">
      <recipe-bottom-nav v-model="activeTab" />
    </div>
  </div>
</template>
