<script setup lang="ts">
const emit = defineEmits<{
  close: [];
}>();

const name = ref('');

type ListItem = {
  id: number;
  text: string;
};

let nextIngredientId = 1;
let nextInstructionId = 1;

const ingredients = ref<ListItem[]>([{ id: nextIngredientId++, text: '' }]);
const instructions = ref<ListItem[]>([]);

const isSaving = ref(false);
const errorMessage = ref('');

const isFormValid = computed(() => {
  const hasName = name.value.trim().length > 0;
  const hasIngredient = ingredients.value.some((i) => i.text.trim().length > 0);
  return hasName && hasIngredient;
});

function addIngredient() {
  ingredients.value.push({ id: nextIngredientId++, text: '' });
}

function removeIngredient(id: number) {
  ingredients.value = ingredients.value.filter((i) => i.id !== id);
}

function addInstruction() {
  instructions.value.push({ id: nextInstructionId++, text: '' });
}

function removeInstruction(id: number) {
  instructions.value = instructions.value.filter((i) => i.id !== id);
}

async function handleSave() {
  if (!isFormValid.value) return;

  isSaving.value = true;
  errorMessage.value = '';

  try {
    const result = await $fetch<{ id: number }>('/api/recipes/manual', {
      method: 'POST',
      body: {
        name: name.value.trim(),
        ingredients: ingredients.value
          .map((i) => i.text.trim())
          .filter((t) => t.length > 0),
        instructions: instructions.value
          .map((i) => i.text.trim())
          .filter((t) => t.length > 0),
      },
    });

    handleClose();
    await navigateTo(`/recipes/${result.id}`);
  } catch (error: unknown) {
    const err = error as { data?: { statusMessage?: string } };
    errorMessage.value = err?.data?.statusMessage || 'Failed to save recipe';
  } finally {
    isSaving.value = false;
  }
}

function handleClose() {
  emit('close');
}

function resetState() {
  name.value = '';
  nextIngredientId = 1;
  nextInstructionId = 1;
  ingredients.value = [{ id: nextIngredientId++, text: '' }];
  instructions.value = [];
  errorMessage.value = '';
}
</script>

<template>
  <UModal :close="{ onClick: handleClose }" @after:leave="resetState">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-default">Add Recipe Manually</h3>
            <UButton
              icon="i-heroicons-x-mark"
              color="neutral"
              variant="ghost"
              @click="handleClose"
            />
          </div>
        </template>

        <div class="space-y-6">
          <!-- Recipe Name -->
          <div>
            <label class="block text-sm font-medium text-toned mb-1">Recipe Name</label>
            <UInput
              v-model="name"
              class="w-full"
              placeholder="e.g. Spaghetti Carbonara"
              :disabled="isSaving"
            />
          </div>

          <!-- Ingredients -->
          <div>
            <label class="block text-sm font-medium text-toned mb-2">Ingredients</label>
            <div class="space-y-2">
              <div
                v-for="item in ingredients"
                :key="item.id"
                class="flex gap-2 items-center"
              >
                <UInput
                  v-model="item.text"
                  class="flex-1"
                  placeholder="e.g. 2 cups flour"
                  :disabled="isSaving"
                  @keydown.enter.prevent="addIngredient"
                />
                <UButton
                  icon="i-heroicons-trash"
                  color="neutral"
                  variant="ghost"
                  size="md"
                  :disabled="isSaving || ingredients.length === 1"
                  @click="removeIngredient(item.id)"
                />
              </div>
            </div>
            <UButton
              icon="i-heroicons-plus"
              color="neutral"
              variant="outline"
              size="sm"
              class="mt-2"
              :disabled="isSaving"
              @click="addIngredient"
            >
              Add Ingredient
            </UButton>
          </div>

          <!-- Instructions -->
          <div>
            <label class="block text-sm font-medium text-toned mb-2">Instructions</label>
            <div class="space-y-2">
              <div
                v-for="(item, index) in instructions"
                :key="item.id"
                class="flex gap-2 items-start"
              >
                <span class="text-sm text-muted mt-2 w-5 shrink-0 text-right">{{ index + 1 }}.</span>
                <UTextarea
                  v-model="item.text"
                  class="flex-1"
                  placeholder="Describe this step..."
                  :disabled="isSaving"
                  :rows="2"
                  autoresize
                  @keydown.enter.prevent="addInstruction"
                />
                <UButton
                  icon="i-heroicons-trash"
                  color="neutral"
                  variant="ghost"
                  size="md"
                  :disabled="isSaving"
                  @click="removeInstruction(item.id)"
                />
              </div>
            </div>
            <UButton
              icon="i-heroicons-plus"
              color="neutral"
              variant="outline"
              size="sm"
              class="mt-2"
              :disabled="isSaving"
              @click="addInstruction"
            >
              Add Step
            </UButton>
          </div>

          <div v-if="errorMessage" class="text-error text-sm">
            {{ errorMessage }}
          </div>
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
              :disabled="!isFormValid || isSaving"
              @click="handleSave"
            >
              Save Recipe
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
