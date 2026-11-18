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
    // A plain static folder (vercel.json deploys .output/public). On Vercel, Nitro would otherwise pick its
    // vercel-static output, which has no rule to answer missing URLs with 404.html.
    preset: "static",
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
      // Nuxt's own 404.html and 200.html are empty client-only shells. Every page is prerendered, so neither
      // is needed: 200.html would make the host answer any missing URL with 200, and 404.html is replaced by
      // the rendered not-found page, which reads without JavaScript and carries its noindex.
      "prerender:generate"(route) {
        if (route.route === "/404.html" || route.route === "/200.html") route.skip = true;
        if (route.route === "/404") route.fileName = "/404.html";
      },
    },
  },
  image: {
    // "ipx" becomes the prebuilt images when generating and the on-demand server in `nuxt dev`
    // ("ipxStatic" never serves /_ipx in dev). Naming it also keeps Vercel's runtime provider from being picked.
    provider: "ipx",
    format: ["webp"],
    screens: { lg: 1024 },
    // The profile photo stays in the shared assets package. Each listed folder is also published as is,
    // so this points at the photos only (not the package's manifest and tests).
    dirs: [fileURLToPath(new URL("../../packages/assets/photos", import.meta.url))],
  },
  content: {
    experimental: { sqliteConnector: "native" },
  },
  hooks: {
    // Nuxt hints every lazy chunk with an idle-time prefetch. The desktop pointer is loaded only for a mouse
    // (app/plugins/pointer.client.ts), so touch screens must not download it either.
    "build:manifest"(manifest) {
      for (const chunk of Object.values(manifest)) {
        chunk.dynamicImports = chunk.dynamicImports?.filter((id) => !id.includes("motion/pointer"));
      }
    },
  },
  devtools: { enabled: false },
  telemetry: false,
});
