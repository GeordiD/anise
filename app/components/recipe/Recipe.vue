<script setup lang="ts">
import type { GetRecipeByIdResponse } from '~~/server/api/recipes/[id].get';

defineProps<{
  recipe: GetRecipeByIdResponse;
}>();
</script>

<template>
  <div class="space-y-8">
    <!-- Recipe title and meta info -->
    <div class="space-y-4">
      <h1 class="text-4xl font-bold text-default">{{ recipe.name }}</h1>

      <div
        v-if="recipe.cuisine"
        class="inline-block bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm font-medium"
      >
        {{ recipe.cuisine }}
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-8">
      <!-- Ingredients -->
      <div>
        <h2 class="text-2xl font-bold text-default mb-4">Ingredients</h2>
        <div class="space-y-6">
          <div
            v-for="(group, index) in recipe.ingredients"
            :key="index"
            class="space-y-2"
          >
            <h3
              v-if="group.name"
              class="text-lg font-semibold text-toned border-b border-neutral-200 dark:border-neutral-700 pb-1"
            >
              {{ group.name }}
            </h3>
            <ul class="space-y-1">
              <li
                v-for="(ingredient, itemIndex) in group.items"
                :key="itemIndex"
                class="flex items-start"
              >
                <span
                  class="text-primary-600 dark:text-primary-400 mr-2 mt-1.5 w-1 h-1 bg-current rounded-full flex-shrink-0"
                />
                <span class="text-toned">{{ ingredient }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div>
        <h2 class="text-2xl font-bold text-default mb-4">Instructions</h2>
        <ol class="space-y-4">
          <li
            v-for="(instruction, index) in recipe.instructions"
            :key="index"
            class="flex items-start"
          >
            <span
              class="bg-primary-600 dark:bg-primary-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0"
            >
              {{ index + 1 }}
            </span>
            <span class="text-toned leading-relaxed">{{ instruction }}</span>
          </li>
        </ol>
      </div>
    </div>

    <!-- Notes -->
    <div
      v-if="recipe.notes && recipe.notes.length > 0"
      class="border-t border-neutral-200 dark:border-neutral-700 pt-8"
    >
      <h2 class="text-2xl font-bold text-default mb-4">Notes</h2>
      <div
        class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4"
      >
        <ul class="space-y-2">
          <li
            v-for="(note, index) in recipe.notes"
            :key="index"
            class="flex items-start"
          >
            <span
              class="text-yellow-600 dark:text-yellow-400 mr-2 mt-1.5 w-1 h-1 bg-current rounded-full flex-shrink-0"
            />
            <span class="text-toned">{{ note }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
