<script lang="ts" setup>
const { isVisible: isNavVisible } = useNavBarScrollDetector();
</script>

<template>
  <!-- Navigation Bar -->
  <nav
    :class="[
      'h-14 fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3 transition-transform duration-300',
      isNavVisible ? 'translate-y-0' : '-translate-y-full',
    ]"
  >
    <div class="max-w-4xl mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <!-- App Title -->
        <NuxtLink
          to="/"
          class="hover:opacity-80 transition-opacity"
        >
          <img
            src="~/assets/images/heirloom-wordmark.svg"
            alt="heirloom"
            class="h-6 text-default"
          />
        </NuxtLink>
      </div>

      <div class="flex items-center space-x-2">
        <!-- Add Recipe Link -->
        <NuxtLink
          to="/add-recipe"
          class="text-sm font-medium text-muted hover:text-default"
        >
          <UButton variant="ghost" icon="i-heroicons-plus" class="text-muted" />
        </NuxtLink>

        <!-- Color Mode Toggle -->
        <ColorPicker />
      </div>
    </div>
  </nav>

  <!-- Nav bar placeholder (should match nav height) -->
  <div class="h-14 invisible" />
</template>

<style></style>
