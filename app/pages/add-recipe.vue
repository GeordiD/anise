<script setup lang="ts">
interface FetchRecipeRequest {
  url: string
}

interface FetchRecipeResponse {
  success: boolean
  message: string
  url: string
}

// Form state
const url = ref('')
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Form validation
const isValidUrl = computed(() => {
  if (!url.value) return false
  try {
    new URL(url.value)
    return true
  } catch {
    return false
  }
})

const isFormValid = computed(() => isValidUrl.value && !isLoading.value)

// Clear messages when URL changes
watch(url, () => {
  successMessage.value = ''
  errorMessage.value = ''
})

// Submit handler
const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await $fetch<FetchRecipeResponse>('/api/recipes/fetch', {
      method: 'POST',
      body: {
        url: url.value
      } as FetchRecipeRequest
    })

    if (response.success) {
      successMessage.value = response.message || 'Recipe added successfully!'
      url.value = '' // Clear form on success
    } else {
      errorMessage.value = response.message || 'Failed to add recipe'
    }
  } catch (error: unknown) {
    console.error('Error adding recipe:', error)
    const errorData = error as { data?: { message?: string } }
    errorMessage.value = errorData.data?.message || 'An error occurred while adding the recipe'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-8">Add Recipe</h1>

    <div class="space-y-6">
      <!-- URL Input Form -->
      <UCard>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label for="recipe-url" class="block text-sm font-medium text-toned mb-2">
              Recipe URL
            </label>
            <UInput
              id="recipe-url"
              v-model="url"
              type="url"
              placeholder="https://example.com/recipe"
              :disabled="isLoading"
              size="lg"
              class="w-full"
            />
            <p v-if="url && !isValidUrl" class="mt-1 text-sm text-error">
              Please enter a valid URL
            </p>
          </div>

          <UButton
            type="submit"
            :disabled="!isFormValid"
            :loading="isLoading"
            size="lg"
            class="w-full"
          >
            {{ isLoading ? 'Adding Recipe...' : 'Add Recipe' }}
          </UButton>
        </form>
      </UCard>

      <!-- Success Message -->
      <UAlert
        v-if="successMessage"
        icon="i-heroicons-check-circle"
        color="success"
        variant="solid"
        :title="successMessage"
      />

      <!-- Error Message -->
      <UAlert
        v-if="errorMessage"
        icon="i-heroicons-exclamation-triangle"
        color="error"
        variant="solid"
        :title="errorMessage"
      />

      <!-- Instructions -->
      <UCard class="bg-info-50 dark:bg-info-900/20 border-info-200 dark:border-info-700">
        <div class="text-sm text-info">
          <h3 class="font-medium mb-2">How to add a recipe:</h3>
          <ol class="list-decimal list-inside space-y-1">
            <li>Copy the URL of a recipe from any cooking website</li>
            <li>Paste it into the URL field above</li>
            <li>Click "Add Recipe" to fetch and save it to your collection</li>
          </ol>
        </div>
      </UCard>
    </div>
  </div>
</template>