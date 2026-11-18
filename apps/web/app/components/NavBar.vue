<script setup lang="ts">
import { computed } from "vue";
import { NuxtLink } from "#components";
import { useLocale, useT } from "~/composables/use-locale";
import { localizePath } from "~/i18n/config";
import type { Section } from "~/lib/section";

defineProps<{ current: Section }>();
const locale = useLocale();
const t = useT();
const items = computed(
  () =>
    [
      { section: "about", to: localizePath("/about", locale.value), label: t.value("nav.about") },
      {
        section: "works",
        to: localizePath("/works/apps", locale.value),
        label: t.value("nav.works"),
      },
      { section: "press", to: localizePath("/press", locale.value), label: t.value("nav.press") },
    ] as const,
);
</script>

<template>
  <nav class="nav-bar" :aria-label="t('nav.label')">
    <ul class="flex gap-1">
      <li v-for="item in items" :key="item.section">
        <NuxtLink
          :to="item.to"
          class="nav-item text-callout"
          :class="
            item.section === current ? 'bg-bar-active font-bold text-on-bar' : 'text-on-bar-muted'
          "
          :aria-current="item.section === current ? 'page' : undefined"
          data-cursor="block"
        >
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.nav-bar {
  position: fixed;
  left: 50%;
  bottom: calc(var(--bottom-inset) + 8px);
  z-index: 30;
  translate: -50% 0;
  padding: 4px;
  border-radius: var(--ut-radius-full);
  background: var(--ut-color-bar);
  box-shadow: var(--ut-shadow-float);
}

.nav-item {
  display: grid;
  place-items: center;
  width: 84px;
  height: 40px;
  border-radius: var(--ut-radius-full);
  transition:
    background-color var(--ut-duration-base) var(--ut-ease-out),
    color var(--ut-duration-base) var(--ut-ease-out),
    scale var(--ut-duration-fast) var(--ut-ease-out);
}

/* Phones: a tab sinks while it is pressed (visual spec §9.5). */
@media (width < 64rem) {
  .nav-item:active {
    scale: 0.92;
  }
}

@media (width >= 64rem) {
  .nav-bar {
    top: 14px;
    bottom: auto;
  }
}
</style>
