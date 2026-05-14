// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  modules: ['@nuxt/eslint', '@pinia/nuxt'],
  css: ['@nordhealth/css', '@nordhealth/themes/lib/vet.css'],
  nitro: {
    prerender: {
      routes: ['/', '/success'],
    },
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag: string) => tag.startsWith('nord-'),
    },
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['@nordhealth/components/lib/vue.d.ts'],
      },
    },
  },
})
