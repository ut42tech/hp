<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { otherTheme, storeTheme } from "../lib/theme";
import { switchTheme } from "../motion/theme-switch";
import UiIcon from "./UiIcon.vue";

defineProps<{ label: string }>();

const icon = { light: "sun", dark: "moon" } as const;

// A switch named "dark mode". Whether it is on is only known in the browser, so aria-pressed comes once mounted;
// the icon is right before that, from [data-theme] (the inline script in SiteShell.vue sets it before first
// paint, and follows the OS while nothing is stored).
const dark = ref<boolean>();
const sync = () => (dark.value = document.documentElement.dataset.theme === "dark");
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
      root.dataset.theme = next;
      dark.value = next === "dark";
    },
    { x: box.left + box.width / 2, y: box.top + box.height / 2 },
  );
}
</script>

<template>
  <button
    type="button"
    class="theme-toggle text-fg"
    :aria-label="label"
    :aria-pressed="dark"
    data-cursor="block"
    @click="toggle"
  >
    <span v-for="(name, key) in icon" :key="key" class="theme-icon" :data-theme-icon="key">
      <UiIcon :name="name" :size="20" />
    </span>
  </button>
</template>

<style scoped>
/* A circle, so the pointer settles on it as on any other button. */
.theme-toggle {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--ut-radius-full);
}

/* The sun and the moon share one cell and trade places: the outgoing one turns away and shrinks, the incoming
   one turns in and settles with a little overshoot. */
.theme-icon {
  display: grid;
  grid-area: 1 / 1;
  transition:
    rotate 500ms var(--ut-ease-overshoot),
    scale 500ms var(--ut-ease-overshoot),
    opacity 200ms linear;
}

.theme-icon[data-theme-icon="dark"],
:root[data-theme="dark"] .theme-icon[data-theme-icon="light"] {
  rotate: 90deg;
  scale: 0.4;
  opacity: 0;
}

:root[data-theme="dark"] .theme-icon[data-theme-icon="dark"] {
  rotate: 0deg;
  scale: 1;
  opacity: 1;
}

/* Reduced motion: the icons just swap. */
@media (prefers-reduced-motion: reduce) {
  .theme-icon {
    transition: none;
  }
}
</style>
