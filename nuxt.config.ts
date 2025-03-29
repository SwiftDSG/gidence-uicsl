// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      controllerBase: process.env.CONTROLLER_URL || "http://localhost:8000",
      base: process.env.BASE_URL || "http://localhost:3000",
    },
  },
  css: ["~/assets/fonts.scss"],
})
