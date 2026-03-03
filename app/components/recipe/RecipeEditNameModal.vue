<script setup lang="ts">
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get'

const props = defineProps<{
  recipe: GetRecipeByIdResponse
}>()

const emit = defineEmits<{
  close: []
}>()

const name = ref(props.recipe.name)
const isSaving = ref(false)

const handleSave = async () => {
  const trimmed = name.value.trim()
  if (!trimmed || trimmed === props.recipe.name) {
    emit('close')
    return
  }

  isSaving.value = true
  try {
    await $fetch(`/api/recipes/${props.recipe.id}`, {
      method: 'PATCH',
      body: { name: trimmed },
    })
    await refreshNuxtData(`recipe-${props.recipe.id}`)
    emit('close')
  } catch (error) {
    console.error('Failed to update recipe name:', error)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <UModal :close="{ onClick: () => emit('close') }">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-default">Edit Recipe Name</h3>
            <UButton
              icon="i-heroicons-x-mark"
              color="neutral"
              variant="ghost"
              @click="emit('close')"
            />
          </div>
        </template>

        <UFormField label="Recipe name">
          <UInput
            v-model="name"
            class="w-full"
            autofocus
            :disabled="isSaving"
            @keydown.enter="handleSave"
            @keydown.escape="emit('close')"
          />
        </UFormField>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              :disabled="isSaving"
              @click="emit('close')"
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
