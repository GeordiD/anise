<script lang="ts" setup>
const colorMode = useColorMode();

// Toggle color mode
const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};
</script>

<template>
  <ClientOnly>
    <UButton
      variant="ghost"
      :icon="
        colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'
      "
      class="text-muted"
      @click="toggleColorMode"
    />
    <template #fallback>
      <UButton
        variant="ghost"
        icon="i-heroicons-moon"
        class="text-muted"
        @click="toggleColorMode"
      />
    </template>
  </ClientOnly>
</template>

<style></style>
