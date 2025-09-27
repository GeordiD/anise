// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@nuxtjs/color-mode',
  ],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'system', // default value of $colorMode.preference
    fallback: 'light', // fallback value if not system preference found
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storageKey: 'nuxt-color-mode',
  },
  nitro: {
    experimental: {
      openAPI: true,
    },
    openAPI: {
      ui: {
        scalar:
          process.env.NODE_ENV !== 'production' ||
          process.env.ENABLE_SWAGGER === 'true',
      },
    },
  },
});
