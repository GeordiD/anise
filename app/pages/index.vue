<script setup lang="ts">
import { h } from 'vue';
import type { TableColumn, TableRow } from '@nuxt/ui';
import type { RecipesResponse } from '~~/server/api/recipes/index.get';
import type { Recipe } from '~~/server/services/recipeService';
import { useSortable } from '@vueuse/integrations/useSortable';

// Fetch recipes from the API
const {
  data: recipesData,
  pending,
  error,
} = await useFetch<RecipesResponse>('/api/recipes');

const recipes = computed(() => recipesData.value?.recipes || []);

// Sorting state
const sorting = ref([]);

// Table columns configuration
const columns: TableColumn<Recipe>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h('button', {
        class: 'flex items-center gap-2 font-medium hover:text-primary transition-colors',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }, [
        'Recipe',
        h('span', {
          class: isSorted
            ? (isSorted === 'asc'
              ? 'i-lucide-arrow-up-narrow-wide'
              : 'i-lucide-arrow-down-wide-narrow')
            : 'i-lucide-arrow-up-down text-muted',
        }),
      ]);
    },
    cell: ({ row }) => h('span', { class: 'text-default' }, row.getValue('name')),
  },
  {
    accessorKey: 'cuisine',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h('button', {
        class: 'flex items-center gap-2 font-medium hover:text-primary transition-colors',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }, [
        'Cuisine',
        h('span', {
          class: isSorted
            ? (isSorted === 'asc'
              ? 'i-lucide-arrow-up-narrow-wide'
              : 'i-lucide-arrow-down-wide-narrow')
            : 'i-lucide-arrow-up-down text-muted',
        }),
      ]);
    },
    cell: ({ row }) => row.getValue('cuisine') || '—',
  },
];

// Enable drag and drop for table rows
const tableData = ref(recipes.value);
watch(recipes, (newRecipes) => {
  tableData.value = newRecipes;
});

useSortable('.recipes-table-tbody', tableData, {
  animation: 150,
});

// Navigate to recipe detail page on row click
const router = useRouter();
function onSelect(row: TableRow<Recipe>, _e?: Event) {
  router.push(`/recipes/${row.original.id}`);
}
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Recipes</h1>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <div class="text-muted">Loading recipes...</div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-error py-12 text-center">
      <p>Failed to load recipes. Please try again later.</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="recipes.length === 0" class="text-muted py-12 text-center">
      <p>No recipes found.</p>
    </div>

    <template v-else>
      <!-- Recipe table (desktop only) -->
      <div class="hidden lg:block">
        <UTable
          v-model:sorting="sorting"
          :data="tableData"
          :columns="columns"
          :ui="{
            root: 'border border-default rounded-lg overflow-hidden',
            tbody: 'recipes-table-tbody [&>tr]:cursor-pointer [&>tr]:hover:bg-accented [&>tr]:transition-colors',
            th: 'text-lg',
            td: 'text-base',
          }"
          @select="onSelect"
        />
      </div>

      <!-- Recipe grid (mobile and tablet) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6">
        <RecipeCard v-for="recipe in recipes" :key="recipe.id" :recipe="recipe" />
      </div>
    </template>
  </div>
</template>
