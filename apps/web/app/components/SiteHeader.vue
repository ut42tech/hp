<script setup lang="ts">
import { computed } from "vue";
import { NuxtLink } from "#components";
import { useLocale, useT } from "~/composables/use-locale";
import { localizePath } from "~/i18n/config";
import LocaleSwitch from "./LocaleSwitch.vue";
import ThemeToggle from "./ThemeToggle.vue";

const locale = useLocale();
const t = useT();
const labels = computed(() => ({
  auto: t.value("theme.auto"),
  light: t.value("theme.light"),
  dark: t.value("theme.dark"),
}));
</script>

<template>
  <header class="site-header">
    <NuxtLink :to="localizePath('/', locale)" class="text-headline text-fg" data-cursor="block">
      @ut42tech
    </NuxtLink>
    <div class="flex items-center">
      <LocaleSwitch />
      <ThemeToggle :labels="labels" />
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: calc(var(--top-inset) + var(--row));
  padding-top: var(--top-inset);
  padding-inline: var(--gutter-left) calc(var(--gutter-right) - 12px);
  /* Its own layer during view transitions, kept above the travelling thumbnail (global.css). */
  view-transition-name: site-header;
}

/* Desktop: pages scroll under the header, so it is a frosted layer of the page colour that keeps its
   controls clear (without it, the toggles sat on top of the cards at 1024–1130px). */
@media (width >= 64rem) {
  .site-header {
    height: var(--header-height-desktop);
    padding: 0 20px 0 32px;
    background: color-mix(in srgb, var(--ut-color-bg) 72%, transparent);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    backdrop-filter: blur(20px) saturate(180%);
  }
}
</style>
