<script lang="ts" setup>
const activeTab = defineModel<'ingredients' | 'instructions'>();
</script>

<template>
  <div class="bg-muted h-9 rounded-full p-[3px] flex">
    <button
      type="button"
      :class="[
        'flex-1 rounded-full px-2 py-1 text-sm font-medium transition-colors',
        activeTab === 'ingredients'
          ? 'bg-primary text-cream-100'
          : 'text-default',
      ]"
      @click="activeTab = 'ingredients'"
    >
      Ingredients
    </button>
    <button
      type="button"
      :class="[
        'flex-1 rounded-full px-2 py-1 text-sm font-medium transition-colors',
        activeTab === 'instructions'
          ? 'bg-primary text-cream-100'
          : 'text-default',
      ]"
      @click="activeTab = 'instructions'"
    >
      Instructions
    </button>
  </div>
</template>

<style></style>
