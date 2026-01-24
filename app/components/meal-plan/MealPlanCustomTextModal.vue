<script setup lang="ts">
import type { AddMealRequest } from '~~/server/api/meal-plan/meals.post';

const props = defineProps<{
  dayId: number;
  mealType: 'lunch' | 'dinner';
}>();

const emit = defineEmits<{
  close: [isSave: boolean];
}>();

const customText = ref('');
const submitting = ref(false);

async function handleSubmit() {
  if (!customText.value.trim()) return;

  submitting.value = true;

  try {
    const payload: AddMealRequest = {
      dayId: props.dayId,
      mealType: props.mealType,
      customText: customText.value.trim(),
    };

    await $fetch('/api/meal-plan/meals', {
      method: 'POST',
      body: payload,
    });

    await refreshNuxtData('meal-plan');

    emit('close', true);
  } catch (err) {
    console.error('Failed to add custom meal:', err);
    submitting.value = false;
  }
}

function handleClose() {
  emit('close', false);
}

function resetState() {
  customText.value = '';
  submitting.value = false;
}
</script>

<template>
  <UModal :close="{ onClick: handleClose }" @after:leave="resetState">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-default">Add Free Form</h3>
            <UButton
              icon="i-heroicons-x-mark"
              color="neutral"
              variant="ghost"
              @click="handleClose"
            />
          </div>
        </template>

        <div class="space-y-4">
          <UInput
            v-model="customText"
            placeholder="e.g., Leftovers"
            class="w-full"
            autofocus
            @keyup.enter="handleSubmit"
          />
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton @click="handleClose"> Cancel </UButton>
            <UButton
              color="primary"
              variant="solid"
              size="md"
              :disabled="!customText.trim() || submitting"
              :loading="submitting"
              @click="handleSubmit"
            >
              Add
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
