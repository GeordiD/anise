<script lang="ts" setup>
const isDeleting = ref(false);
const isShowingConfirmation = ref(false);

const { recipeId } = defineProps<{
  recipeId: number;
}>();

const router = useRouter();

const handleDelete = async () => {
  isDeleting.value = true;

  try {
    await $fetch(`/api/recipes/${recipeId}`, {
      method: 'DELETE',
    });

    // Redirect to home page after successful delete
    await router.push('/');
  } catch (error) {
    console.error('Failed to delete recipe:', error);
    alert('Failed to delete recipe. Please try again.');
    isDeleting.value = false;
  } finally {
    isShowingConfirmation.value = false;
  }
};
</script>

<template>
  <div>
    <UButton
      v-if="!isShowingConfirmation && !isDeleting"
      icon="i-fe-trash"
      color="error"
      variant="ghost"
      size="lg"
      :loading="isDeleting"
      aria-label="Delete recipe"
      @click="isShowingConfirmation = true"
    />
    <div v-if="isShowingConfirmation" class="flex gap-2 items-center">
      <p>Are you sure?</p>
      <UButton
        color="neutral"
        variant="outline"
        size="lg"
        @click="isShowingConfirmation = false"
        >No</UButton
      >
      <UButton color="error" size="lg" @click="handleDelete">Yes</UButton>
    </div>
  </div>
</template>

<style></style>
