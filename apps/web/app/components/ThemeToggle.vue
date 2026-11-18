<script setup lang="ts">
import { otherTheme, storeTheme, type Theme } from "../lib/theme";
import { switchTheme } from "../motion/theme-switch";
import UiIcon from "./UiIcon.vue";

const props = defineProps<{ labels: Record<Theme, string> }>();

const icon = { light: "sun", dark: "moon" } as const;

const safeStorage = (): Storage | undefined => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

// Flips between light and dark from whatever the page shows now (the inline script in SiteShell.vue set it
// before first paint, from the stored choice or the OS). The new theme grows from the button's centre.
function toggle(event: MouseEvent) {
  const root = document.documentElement;
  const next = otherTheme(root.dataset.theme === "dark" ? "dark" : "light");
  const os = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  storeTheme(safeStorage(), next, os);
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
  switchTheme(document, () => (root.dataset.theme = next), {
    x: box.left + box.width / 2,
    y: box.top + box.height / 2,
  });
}
</script>

<template>
  <button type="button" class="theme-toggle text-fg" data-cursor="block" @click="toggle">
    <!-- Both are rendered and CSS picks one from [data-theme], which the inline script in SiteShell.vue sets
         before first paint, so the icon and the name are right before this component hydrates. The hidden
         one is display: none, so assistive tech reads only one name. -->
    <span v-for="(name, key) in icon" :key="key" class="theme-icon" :data-theme-icon="key">
      <UiIcon :name="name" :size="20" />
      <span class="sr-only">{{ props.labels[key] }}</span>
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

.theme-icon {
  display: none;
}

:root:not([data-theme="dark"]) .theme-icon[data-theme-icon="light"],
:root[data-theme="dark"] .theme-icon[data-theme-icon="dark"] {
  display: contents;
}
</style>
