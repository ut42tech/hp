import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineNuxtConfig } from "nuxt/config";
import { localizePath, publishedLocales } from "./app/i18n/config";

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
      // Everything else is found by following links from these.
      routes: [
        "/",
        "/404",
        ...publishedLocales.flatMap((locale) => [
          localizePath("/", locale),
          localizePath("/works", locale),
        ]),
      ],
      crawlLinks: true,
      failOnError: true,
    },
    hooks: {
      // Nuxt's own 404.html is an empty client-only shell; write the rendered not-found page there instead,
      // so it reads without JavaScript and carries its noindex.
      "prerender:generate"(route) {
        if (route.route === "/404.html") route.skip = true;
        if (route.route === "/404") route.fileName = "/404.html";
      },
    },
  },
  image: {
    provider: "ipxStatic",
    format: ["webp"],
    screens: { lg: 1024 },
    // The profile photo stays in the shared assets package. Each listed folder is also published as is,
    // so this points at the photos only (not the package's manifest and tests).
    dirs: [fileURLToPath(new URL("../../packages/assets/photos", import.meta.url))],
  },
  content: {
    experimental: { sqliteConnector: "native" },
  },
  devtools: { enabled: false },
  telemetry: false,
});
