<script setup lang="ts">
import { Classic } from "@theme-toggles/vue";
import "@theme-toggles/vue/styles/classic.css";
import { THEME_SWITCH } from "@ut42tech/tokens/motion";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { applyTheme, otherTheme, storeTheme } from "../lib/theme";
import { switchTheme } from "../motion/theme-switch";

defineProps<{ label: string }>();

// The icon is @theme-toggles/vue's Classic: its sun turns into a moon by CSS. Until the page is in the browser,
// `toggled` is passed as undefined and the icon follows the `.dark` class that the inline script in
// SiteShell.vue puts on the root before first paint (left out, Vue would turn the Boolean prop into false and
// pin the sun). Once mounted it is the theme, which also gives the button its aria-pressed.
const dark = ref<boolean>();
const sync = () => (dark.value = document.documentElement.dataset.theme === "dark");
// Without a stored choice the inline script follows the OS as it changes; follow it here too.
let media: MediaQueryList | undefined;
onMounted(() => {
  sync();
  media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", sync);
});
onBeforeUnmount(() => media?.removeEventListener("change", sync));

const safeStorage = (): Storage | undefined => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

// Flips between light and dark from whatever the page shows now. The new theme grows from the button's centre.
function toggle(event: MouseEvent) {
  const root = document.documentElement;
  const next = otherTheme(root.dataset.theme === "dark" ? "dark" : "light");
  const os = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  storeTheme(safeStorage(), next, os);
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
  switchTheme(
    document,
    () => {
      applyTheme(root, next);
      dark.value = next === "dark";
    },
    { x: box.left + box.width / 2, y: box.top + box.height / 2 },
  );
}
</script>

<template>
  <!-- Remounted once in the browser: the toggle numbers its clip path from a counter in its module, which
       prerendering runs across every page, so the hydrated moon would point at a clip path that does not
       exist. The fresh one is numbered by the browser at both ends. -->
  <Classic
    :key="dark === undefined ? 'prerendered' : 'browser'"
    class="theme-toggle text-fg"
    :duration="THEME_SWITCH.iconMs"
    :toggled="dark"
    :aria-label="label"
    title=""
    data-cursor="block"
    @click="toggle"
  />
</template>

<style scoped>
/* A circle, so the pointer settles on it as on any other button; the icon is 1em. */
.theme-toggle {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--ut-radius-full);
  font-size: 20px;
}
</style>
