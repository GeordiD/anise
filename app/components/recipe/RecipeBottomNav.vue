<script lang="ts" setup>
const activeTab = defineModel<'ingredients' | 'instructions'>();
</script>

<template>
  <div
    class="fixed bottom-0 left-0 right-0 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 shadow-lg"
  >
    <div class="grid grid-cols-2">
      <button
        type="button"
        :class="[
          'py-4 px-6 text-center font-semibold transition-colors',
          activeTab === 'ingredients'
            ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
            : 'text-toned hover:bg-neutral-100 dark:hover:bg-neutral-800',
        ]"
        @click="activeTab = 'ingredients'"
      >
        Ingredients
      </button>
      <button
        type="button"
        :class="[
          'py-4 px-6 text-center font-semibold transition-colors',
          activeTab === 'instructions'
            ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
            : 'text-toned hover:bg-neutral-100 dark:hover:bg-neutral-800',
        ]"
        @click="activeTab = 'instructions'"
      >
        Instructions
      </button>
    </div>
  </div>
</template>

<style></style>
