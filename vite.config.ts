import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite-plus";

const ignorePatterns = ["**/dist/**", "**/.astro/**", "**/.vercel/**"];

export default defineConfig({
  // Lets tests import .vue components (apps/web).
  plugins: [vue()],
  lint: {
    plugins: ["typescript", "vue"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    ignorePatterns,
  },
  fmt: {
    astro: true,
    ignorePatterns,
  },
});
