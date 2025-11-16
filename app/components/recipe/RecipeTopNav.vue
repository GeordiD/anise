<script setup lang="ts">
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get'
import RecipeIngredientsEditModal from './ingredient/RecipeIngredientsEditModal.vue'

const props = defineProps<{
  recipe: GetRecipeByIdResponse
}>()

const router = useRouter()
const isShowingConfirmation = ref(false)
const isDeleting = ref(false)

const overlay = useOverlay()
const editModal = overlay.create(RecipeIngredientsEditModal)

const handleBackClick = () => {
  router.push('/')
}

const handleEdit = () => {
  editModal.open({
    recipe: props.recipe,
  })
}

const handleDelete = async () => {
  isDeleting.value = true

  try {
    await $fetch(`/api/recipes/${props.recipe.id}`, {
      method: 'DELETE',
    })

    // Redirect to home page after successful delete
    await router.push('/')
  } catch (error) {
    console.error('Failed to delete recipe:', error)
    alert('Failed to delete recipe. Please try again.')
    isDeleting.value = false
  } finally {
    isShowingConfirmation.value = false
  }
}

const items = computed(() => [
  [
    {
      label: 'Edit Recipe',
      icon: 'i-heroicons-pencil-square',
      color: 'neutral' as const,
      onSelect: handleEdit,
    },
    {
      label: 'Delete Recipe',
      icon: 'i-heroicons-trash',
      color: 'error' as const,
      onSelect: () => {
        isShowingConfirmation.value = true
      },
    },
  ],
])
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

      <!-- Delete confirmation dialog -->
      <div v-if="isShowingConfirmation" class="flex gap-2 items-center">
        <p>Are you sure?</p>
        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          @click="isShowingConfirmation = false"
        >
          No
        </UButton>
        <UButton
          color="error"
          size="lg"
          :loading="isDeleting"
          @click="handleDelete"
        >
          Yes
        </UButton>
      </div>

      <!-- More menu dropdown -->
      <UDropdownMenu
        v-if="!isShowingConfirmation"
        :items="items"
        :content="{
          align: 'end',
          side: 'bottom',
          sideOffset: 8,
        }"
      >
        <UButton
          icon="i-heroicons-ellipsis-vertical"
          aria-label="More options"
        />
      </UDropdownMenu>
    </div>
  </div>
</template>
