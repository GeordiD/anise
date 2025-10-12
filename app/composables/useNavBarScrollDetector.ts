import { onMounted, onUnmounted, ref } from 'vue';

export function useNavBarScrollDetector(threshold = 10) {
  const isVisible = ref(true);
  const lastScrollY = ref(0);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    // Only hide/show if scrolled past threshold
    if (Math.abs(currentScrollY - lastScrollY.value) < threshold) {
      return;
    }

    if (currentScrollY > lastScrollY.value && currentScrollY > 100) {
      // Scrolling down & past 100px
      isVisible.value = false;
    } else {
      // Scrolling up
      isVisible.value = true;
    }

    lastScrollY.value = currentScrollY;
  };

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });

  return {
    isVisible,
  };
}
