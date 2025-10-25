<script lang="ts" setup>
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

const props = defineProps<{
  recipe: GetRecipeByIdResponse;
}>();

const router = useRouter();
const isDeleting = ref(false);
const showDeleteDialog = ref(false);

const handleDelete = async () => {
  isDeleting.value = true;

  try {
    await $fetch(`/api/recipes/${props.recipe.id}`, {
      method: 'DELETE',
    });

    // Redirect to home page after successful delete
    await router.push('/');
  } catch (error) {
    console.error('Failed to delete recipe:', error);
    alert('Failed to delete recipe. Please try again.');
  } finally {
    isDeleting.value = false;
    showDeleteDialog.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-start justify-between gap-4">
      <h1 class="text-4xl font-bold text-default">{{ recipe.name }}</h1>

      <UButton
        icon="i-heroicons-trash"
        color="error"
        variant="ghost"
        size="lg"
        :loading="isDeleting"
        aria-label="Delete recipe"
        @click="showDeleteDialog = true"
      />
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

    <!-- Delete Confirmation Modal -->
    <UModal v-model="showDeleteDialog">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-default">Delete Recipe</h3>
        </template>

        <p class="text-muted">
          Are you sure you want to delete "{{ recipe.name }}"? This action cannot be undone.
        </p>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              :disabled="isDeleting"
              @click="showDeleteDialog = false"
            >
              Cancel
            </UButton>
            <UButton
              color="error"
              :loading="isDeleting"
              @click="handleDelete"
            >
              Delete
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
