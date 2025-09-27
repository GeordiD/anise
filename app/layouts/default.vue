<script setup lang="ts">
const colorMode = useColorMode();

// Toggle color mode
const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-default">
    <!-- Navigation Bar -->
    <nav
      class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3"
    >
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <!-- App Title -->
          <NuxtLink
            to="/"
            class="text-xl font-semibold text-default hover:text-toned"
          >
            Anise
          </NuxtLink>
        </div>

        <div class="flex items-center space-x-2">
          <!-- Add Recipe Link -->
          <NuxtLink
            to="/add-recipe"
            class="text-sm font-medium text-muted hover:text-default hidden sm:block"
          >
            +
          </NuxtLink>

          <!-- Color Mode Toggle -->
          <UButton
            variant="ghost"
            :icon="
              colorMode.value === 'dark'
                ? 'i-heroicons-sun'
                : 'i-heroicons-moon'
            "
            class="text-muted"
            @click="toggleColorMode"
          />
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 py-6">
      <slot />
    </main>
  </div>
</template>
