// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/test-utils', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
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
