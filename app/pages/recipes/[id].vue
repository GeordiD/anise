<script setup lang="ts">
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

const route = useRoute();
const id = route.params.id as string;

// Fetch recipe details from the API
const {
  data: recipe,
  pending,
  error,
} = await useFetch<GetRecipeByIdResponse>(`/api/recipes/${id}`, {
  key: `recipe-${id}`,
});

// Prevent screen from turning off while viewing recipe
useScreenWakeLock();
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <div class="text-muted">Loading recipe...</div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-error mb-4">
        <p>Recipe not found or failed to load.</p>
      </div>
      <NuxtLink to="/" class="text-primary hover:text-primary font-medium">
        ← Back to Recipes
      </NuxtLink>
    </div>

    <!-- Recipe content -->
    <Recipe v-if="recipe" :recipe="recipe" />
  </div>
</template>
