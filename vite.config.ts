import { defineConfig } from "vite-plus";

const ignorePatterns = ["**/dist/**", "**/.astro/**", "**/.vercel/**"];

export default defineConfig({
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
