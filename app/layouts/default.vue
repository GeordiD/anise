<script setup lang="ts">
const route = useRoute();
const colorMode = useColorMode();

// Show back button on all pages except home
const showBackButton = computed(() => route.path !== '/');

// Toggle color mode
const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <!-- Navigation Bar -->
    <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <!-- Back Button (conditionally shown) -->
          <UButton
            v-if="showBackButton"
            variant="ghost"
            icon="i-heroicons-arrow-left"
            class="lg:hidden"
            @click="$router.back()"
          />
          <!-- App Title -->
          <NuxtLink
            to="/"
            class="text-xl font-semibold text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Anise
          </NuxtLink>
          <!-- Add Recipe Link -->
          <NuxtLink
            to="/add-recipe"
            class="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hidden sm:block"
          >
            Add Recipe
          </NuxtLink>
        </div>

        <div class="flex items-center space-x-2">
          <!-- Color Mode Toggle -->
          <UButton
            variant="ghost"
            :icon="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
            class="text-gray-600 dark:text-gray-400"
            @click="toggleColorMode"
          />

          <!-- Desktop Back Button -->
          <UButton
            v-if="showBackButton"
            variant="ghost"
            icon="i-heroicons-arrow-left"
            class="hidden lg:flex"
            @click="$router.back()"
          >
            Back
          </UButton>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 py-6">
      <slot />
    </main>
  </div>
</template>
