<script setup lang="ts">
import { LayoutGroup } from "motion-v";
import { computed } from "vue";
import { NuxtLink } from "#components";
import { useLocale, useT } from "~/composables/use-locale";
import { localizePath } from "~/i18n/config";
import type { Section } from "~/lib/section";
import SelectionMark from "./SelectionMark.vue";

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
    <LayoutGroup id="nav">
      <ul class="flex gap-1">
        <li v-for="item in items" :key="item.section">
          <NuxtLink
            :to="item.to"
            class="nav-item text-callout"
            :class="item.section === current ? 'font-bold text-on-bar' : 'text-on-bar-muted'"
            :aria-current="item.section === current ? 'page' : undefined"
            data-cursor="block"
          >
            <SelectionMark v-if="item.section === current" id="nav-mark" class="bg-bar-active" />
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </LayoutGroup>
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
  position: relative;
  isolation: isolate;
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
