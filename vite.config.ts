import vue from "@vitejs/plugin-vue";
import { defineConfig, type PluginOption } from "vite-plus";

// Lets tests import .vue components (apps/web). @vitejs/plugin-vue is typed against its own copy of Vite,
// which the type checker cannot compare with vite-plus's copy (TS2321), so the list is cast through unknown.
const plugins = [vue()] as unknown as PluginOption[];
const ignorePatterns = ["**/dist/**", "**/.astro/**", "**/.vercel/**"];

export default defineConfig({
  plugins,
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
