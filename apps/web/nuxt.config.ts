import tailwindcss from "@tailwindcss/vite";
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2026-11-01",
  // Every dependency is imported where it is used, so files read on their own and run outside Nuxt in tests.
  imports: { autoImport: false },
  components: [],
  modules: ["@nuxt/content", "@nuxt/image", "motion-v/nuxt"],
  css: ["~/assets/css/global.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: { siteUrl: "https://ut42tech.com" },
  },
  nitro: {
    prerender: {
      routes: ["/", "/ja/", "/404.html"],
      crawlLinks: true,
      failOnError: true,
    },
  },
  image: {
    provider: "ipxStatic",
    format: ["webp"],
    screens: { lg: 1024 },
    // The profile photo stays in the shared assets package.
    dirs: ["../../packages/assets"],
  },
  content: {
    experimental: { sqliteConnector: "native" },
  },
  devtools: { enabled: false },
  telemetry: false,
});
