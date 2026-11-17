import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://ut42tech.com",
  output: "static",
  i18n: {
    locales: ["ja", "en"],
    defaultLocale: "ja",
    // Both languages live under a prefix; "/" is routed by vercel.json (src/pages/index.astro is the fallback elsewhere).
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
  },
});
