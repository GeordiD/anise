<script setup lang="ts">
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get'

defineProps<{
  recipe: GetRecipeByIdResponse
}>()

const router = useRouter()

const handleBackClick = () => {
  router.push('/')
}
</script>

<template>
  <div
    class="flex items-center justify-between h-10 mb-4 top-14 md:top-0 z-40 bg-background md:bg-transparent"
  >
    <!-- Back button - left side -->
    <UButton
      icon="i-heroicons-chevron-left"
      aria-label="Back to recipes"
      @click="handleBackClick"
    />

    <!-- Right side buttons container -->
    <div class="flex items-center gap-3">
      <!-- Link button -->
      <UButton
        icon="i-heroicons-link"
        aria-label="Open original recipe"
        :href="recipe.sourceUrl"
        target="_blank"
        rel="noopener noreferrer"
      />

      <!-- More menu button (placeholder) -->
      <UButton
        icon="i-heroicons-ellipsis-vertical"
        aria-label="More options"
      />
    </div>
  </div>
</template>
