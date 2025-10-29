<script lang="ts" setup>
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';
import type { SaveSubstitutionResponse } from '~~/server/api/ingredients/[id]/substitution.put';

const { ingredient } = defineProps<{
  ingredient: GetRecipeByIdResponse['ingredients'][number]['items'][number];
}>();

const emit = defineEmits<{
  close: [];
  saved: [ingredientId: number];
}>();

const ingredientInput = ref(ingredient.name ?? '');
const isSaving = ref(false);
const errorMessage = ref<string | null>(null);

const handleSave = async () => {
  if (!ingredientInput.value?.trim()) {
    errorMessage.value = 'Ingredient text cannot be empty';
    return;
  }

  isSaving.value = true;
  errorMessage.value = null;

  try {
    await $fetch<SaveSubstitutionResponse>(
      `/api/ingredients/${ingredient.id}/substitution`,
      {
        method: 'PUT',
        body: {
          ingredient: ingredientInput.value?.trim() || '',
        },
      }
    );

    emit('saved', ingredient.id);
    emit('close');
  } catch (error: unknown) {
    const err = error as { data?: { statusMessage?: string } };
    errorMessage.value =
      err?.data?.statusMessage || 'Failed to save substitution';
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <li class="flex flex-col gap-2">
    <div class="flex gap-2">
      <UInput v-model="ingredientInput" class="fill w-full" />
      <UButton :loading="isSaving" :disabled="isSaving" @click="handleSave">
        Save
      </UButton>
      <UButton
        variant="outline"
        :disabled="isSaving"
        @click="$emit('close')"
      >
        Close
      </UButton>
    </div>
    <div v-if="errorMessage" class="text-error text-sm">
      {{ errorMessage }}
    </div>
  </li>
</template>

<style></style>
