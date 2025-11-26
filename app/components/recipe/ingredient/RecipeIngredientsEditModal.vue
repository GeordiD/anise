<script setup lang="ts">
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

const props = defineProps<{
  recipe: GetRecipeByIdResponse;
}>();

const emit = defineEmits<{
  close: [];
}>();

const route = useRoute();
const recipeId = route.params.id as string;

// Flatten all ingredients from groups into a single array
type FlatIngredient = {
  id: number;
  name: string;
  originalName: string;
  isSubstituted: boolean;
  isUnused: boolean;
};

const ingredients = ref<FlatIngredient[]>([]);

// Initialize ingredients from recipe groups
function initializeIngredients() {
  ingredients.value = props.recipe.ingredients.flatMap((group) =>
    group.items.map((item) => ({
      id: item.id,
      name: item.name || '',
      originalName: item.name || '',
      isSubstituted: item.isSubstituted,
      isUnused: item.isUnused,
    }))
  );
}

initializeIngredients();

// Track which ingredients have been modified
const modifiedIngredients = computed(() =>
  ingredients.value.filter((ing) => ing.name !== ing.originalName)
);

const isSaving = ref(false);
const errorMessage = ref('');

async function handleDelete(ingredientId: number) {
  try {
    await $fetch(`/api/ingredients/${ingredientId}`, {
      method: 'PATCH',
      body: {
        doNotUse: true,
      },
    });

    // Remove from local state
    ingredients.value = ingredients.value.filter(
      (ing) => ing.id !== ingredientId
    );
  } catch (error: unknown) {
    const err = error as { data?: { statusMessage?: string } };
    console.error(
      'Failed to delete ingredient:',
      err?.data?.statusMessage || 'Unknown error'
    );
  }
}

async function handleSave() {
  if (modifiedIngredients.value.length === 0) {
    handleClose();
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';

  try {
    // Save all modified ingredients
    // @todo this should be a batch
    await Promise.all(
      modifiedIngredients.value.map((ingredient) =>
        $fetch(`/api/ingredients/${ingredient.id}/substitution`, {
          method: 'PUT',
          body: {
            ingredient: ingredient.name,
          },
        })
      )
    );

    // Refresh the recipe data using Nuxt's cache invalidation
    await refreshNuxtData(`recipe-${recipeId}`);

    handleClose();
  } catch (error: unknown) {
    const err = error as { data?: { statusMessage?: string } };
    errorMessage.value =
      err?.data?.statusMessage || 'Failed to save ingredients';
  } finally {
    isSaving.value = false;
  }
}

function handleClose() {
  emit('close');
}

function resetState() {
  initializeIngredients();
  errorMessage.value = '';
}
</script>

<template>
  <UModal :close="{ onClick: handleClose }" @after:leave="resetState">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-default">Edit Ingredients</h3>
            <UButton
              icon="i-heroicons-x-mark"
              color="neutral"
              variant="ghost"
              @click="handleClose"
            />
          </div>
        </template>

        <div class="space-y-3.5 max-h-96 overflow-y-auto">
          <div
            v-for="ingredient in ingredients"
            :key="ingredient.id"
            class="flex gap-2 items-center"
          >
            <UInput
              v-model="ingredient.name"
              class="flex-1"
              :disabled="isSaving"
            />
            <UButton
              icon="i-heroicons-trash"
              color="neutral"
              variant="ghost"
              size="md"
              :disabled="isSaving"
              @click="handleDelete(ingredient.id)"
            />
          </div>
        </div>

        <div v-if="errorMessage" class="text-error text-sm mt-4">
          {{ errorMessage }}
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              :disabled="isSaving"
              @click="handleClose"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              :loading="isSaving"
              :disabled="isSaving"
              @click="handleSave"
            >
              Save
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
