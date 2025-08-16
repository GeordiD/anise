<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Recipe Details</h1>
    <p class="text-gray-600">Recipe ID: {{ $route.params.id }}</p>
    <p class="text-gray-600">Recipe details will go here</p>
  </div>
</template>

<script setup>
// Recipe detail page - will show full recipe details
const route = useRoute()
</script>