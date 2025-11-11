<script setup lang="ts">
import type { GetShoppingListResponse } from '~~/server/api/shopping-list/index.get';
import type { UpdateItemResponse } from '~~/server/api/shopping-list/items/[id].patch';

definePageMeta({
  title: 'Shopping List',
});

// Fetch shopping list data
const {
  data: listData,
  pending,
  error,
  refresh,
} = await useFetch<GetShoppingListResponse>('/api/shopping-list');

const shoppingList = computed(() => listData.value?.list);
const items = computed(() => shoppingList.value?.items || []);

// Optimistic UI state for checked items
const optimisticCheckedState = ref<Map<number, boolean>>(new Map());

// Get effective checked state (optimistic or actual)
function isChecked(itemId: number, actualChecked: boolean): boolean {
  return optimisticCheckedState.value.has(itemId)
    ? optimisticCheckedState.value.get(itemId)!
    : actualChecked;
}

// Toggle item checked state
async function toggleItemChecked(itemId: number, currentChecked: boolean) {
  const newChecked = !currentChecked;

  // Optimistic update
  optimisticCheckedState.value.set(itemId, newChecked);

  try {
    await $fetch<UpdateItemResponse>(`/api/shopping-list/items/${itemId}`, {
      method: 'PATCH',
      body: {
        checked: newChecked,
      },
    });

    // Clear optimistic state and refresh
    optimisticCheckedState.value.delete(itemId);
    await refresh();
  } catch (err) {
    console.error('Failed to update item:', err);
    // Revert optimistic update on error
    optimisticCheckedState.value.delete(itemId);
    // TODO: Show error toast
  }
}

// Navigate back to meal plan
function goBackToMealPlan() {
  navigateTo('/meal-plan');
}
</script>

<template>
  <div class="flex flex-col h-screen max-w-[414px] mx-auto">
    <!-- Sticky Header -->
    <header class="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4">
      <h1 class="text-2xl font-bold text-default">Shopping List</h1>
    </header>

    <!-- Main Content - Scrollable -->
    <main class="flex-1 overflow-y-auto px-4 py-4">
      <!-- Loading state -->
      <div v-if="pending" class="flex justify-center py-12">
        <div class="text-muted">Loading shopping list...</div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-error py-12 text-center">
        <p>Failed to load shopping list. Please try again later.</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="!shoppingList || items.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
        <p class="text-muted text-lg">No items in your shopping list</p>
        <UButton
          color="primary"
          class="mt-4"
          @click="goBackToMealPlan"
        >
          Go to Meal Plan
        </UButton>
      </div>

      <!-- Shopping list items -->
      <ul v-else class="space-y-2">
        <li
          v-for="item in items"
          :key="item.id"
          class="flex items-start gap-3 py-2"
          :class="{ 'opacity-50': isChecked(item.id, item.checked) }"
        >
          <!-- Circle checkbox -->
          <button
            type="button"
            class="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
            :class="
              isChecked(item.id, item.checked)
                ? 'border-primary-500 bg-primary-500'
                : 'border-gray-300 dark:border-gray-600'
            "
            @click="toggleItemChecked(item.id, isChecked(item.id, item.checked))"
          >
            <svg
              v-if="isChecked(item.id, item.checked)"
              class="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>

          <!-- Item text -->
          <div class="flex-1 min-w-0">
            <p
              class="text-default text-base break-words"
              :class="{ 'line-through': isChecked(item.id, item.checked) }"
            >
              {{ item.ingredientText }}
            </p>
            <p
              v-if="item.recipeName"
              class="text-muted text-sm mt-1"
            >
              {{ item.recipeName }}
            </p>
          </div>
        </li>
      </ul>
    </main>

    <!-- Fixed Footer -->
    <footer class="sticky bottom-0 z-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-4">
      <UButton
        color="primary"
        size="lg"
        block
        @click="goBackToMealPlan"
      >
        Back to Meal Plan
      </UButton>
    </footer>
  </div>
</template>
