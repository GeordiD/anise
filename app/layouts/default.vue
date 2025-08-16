<script setup lang="ts">
const route = useRoute();

// Show back button on all pages except home
const showBackButton = computed(() => route.path !== '/');
</script>

<template>
  <div class="min-h-screen bg-stone-50 text-gray-900">
    <!-- Navigation Bar -->
    <nav class="bg-white border-b border-gray-200 px-4 py-3">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <!-- Back Button (conditionally shown) -->
          <UButton
            v-if="showBackButton"
            variant="ghost"
            icon="i-heroicons-arrow-left"
            @click="$router.back()"
            class="lg:hidden"
          />
          <!-- App Title -->
          <NuxtLink
            to="/"
            class="text-xl font-semibold text-gray-900 hover:text-gray-700"
          >
            Anise
          </NuxtLink>
        </div>

        <!-- Desktop Back Button -->
        <UButton
          v-if="showBackButton"
          variant="ghost"
          icon="i-heroicons-arrow-left"
          @click="$router.back()"
          class="hidden lg:flex"
        >
          Back
        </UButton>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 py-6">
      <slot />
    </main>
  </div>
</template>
