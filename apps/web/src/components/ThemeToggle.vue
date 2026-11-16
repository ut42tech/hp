<script setup lang="ts">
import { onMounted, ref } from "vue";
import { readStoredTheme, resolveTheme, storeTheme, type Theme } from "../lib/theme";

const theme = ref<Theme>("light");

const safeStorage = (): Storage | undefined => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

onMounted(() => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  theme.value = resolveTheme(readStoredTheme(safeStorage()), prefersDark);
});

function toggle() {
  theme.value = theme.value === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme.value;
  storeTheme(safeStorage(), theme.value);
}
</script>

<template>
  <button
    type="button"
    class="rounded-ut border border-border px-3 py-1 text-sm"
    aria-label="ダークモードを切り替える"
    :aria-pressed="theme === 'dark'"
    @click="toggle"
  >
    {{ theme === "dark" ? "Dark" : "Light" }}
  </button>
</template>
