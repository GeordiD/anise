<script setup lang="ts"></script>

<template>
  <div class="min-h-screen bg-default text-default">
    <NavBar />

    <!-- Main Content (default) -->
    <main class="max-w-4xl mx-auto p-6">
      <slot />
    </main>
  </div>
</template>
