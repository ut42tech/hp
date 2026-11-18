<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import {
  nextPreference,
  readPreference,
  resolveTheme,
  storePreference,
  type ThemePreference,
} from "../lib/theme";
import UiIcon from "./UiIcon.vue";

const props = defineProps<{ labels: Record<ThemePreference, string> }>();

const pref = ref<ThemePreference>("auto");
const icon = { auto: "device-desktop", light: "sun", dark: "moon" } as const;
let media: MediaQueryList | undefined;

const safeStorage = (): Storage | undefined => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

function apply() {
  const root = document.documentElement;
  root.dataset.theme = resolveTheme(pref.value, media?.matches ?? false);
  root.dataset.themePref = pref.value;
}

onMounted(() => {
  media = window.matchMedia("(prefers-color-scheme: dark)");
  pref.value = readPreference(safeStorage());
  media.addEventListener("change", apply);
});

onBeforeUnmount(() => media?.removeEventListener("change", apply));

function cycle() {
  pref.value = nextPreference(pref.value);
  storePreference(safeStorage(), pref.value);
  apply();
}
</script>

<template>
  <button
    type="button"
    class="grid size-11 place-items-center text-fg"
    data-cursor="block"
    @click="cycle"
  >
    <!-- All three are rendered and CSS picks one from [data-theme-pref], which the inline script in
         layouts/Site.astro sets before first paint, so the icon and the name are right before this
         component hydrates. The hidden ones are display: none, so assistive tech reads only one name. -->
    <span v-for="(name, key) in icon" :key="key" class="theme-icon" :data-pref="key">
      <UiIcon :name="name" :size="20" />
      <span class="sr-only">{{ props.labels[key] }}</span>
    </span>
  </button>
</template>

<style scoped>
.theme-icon {
  display: none;
}

:root:not([data-theme-pref="light"], [data-theme-pref="dark"]) .theme-icon[data-pref="auto"],
:root[data-theme-pref="light"] .theme-icon[data-pref="light"],
:root[data-theme-pref="dark"] .theme-icon[data-pref="dark"] {
  display: contents;
}
</style>
