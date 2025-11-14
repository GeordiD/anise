/**
 * Composable to detect if the app is running in PWA (standalone) mode
 * Works on iOS (navigator.standalone) and other platforms (display-mode media query)
 */
export function useIsPWA() {
  const isPWA = ref(false);

  onMounted(() => {
    // Check iOS standalone mode
    const isIOSStandalone = 'standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true;

    // Check display-mode media query (works on most modern browsers)
    const isStandaloneDisplayMode = window.matchMedia('(display-mode: standalone)').matches;

    isPWA.value = isIOSStandalone || isStandaloneDisplayMode;
  });

  return isPWA;
}
