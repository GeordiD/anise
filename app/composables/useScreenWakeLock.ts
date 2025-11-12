/**
 * Composable to prevent the screen from turning off
 * Useful for pages where users need to keep the screen on (e.g., recipe pages, timers)
 *
 * @example
 * ```ts
 * // In your component
 * useScreenWakeLock();
 * ```
 */
export function useScreenWakeLock() {
  const { isSupported, isActive, request, release } = useWakeLock();

  // Request wake lock when component is mounted
  onMounted(() => {
    if (isSupported.value) {
      request('screen');
    }
  });

  // Release wake lock when component is unmounted
  onUnmounted(() => {
    if (isActive.value) {
      release();
    }
  });

  return {
    isSupported,
    isActive,
  };
}
