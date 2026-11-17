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
  document.documentElement.dataset.theme = resolveTheme(pref.value, media?.matches ?? false);
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
    :aria-label="props.labels[pref]"
    data-cursor="block"
    @click="cycle"
  >
    <UiIcon :name="icon[pref]" :size="20" />
  </button>
</template>
