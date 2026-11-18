<script setup lang="ts">
import { LayoutGroup } from "motion-v";
import { computed } from "vue";
import { NuxtLink } from "#components";
import { useLocale, useT } from "~/composables/use-locale";
import { localizePath } from "~/i18n/config";
import { categories, type Category } from "~/lib/works";
import SelectionMark from "./SelectionMark.vue";

const props = withDefaults(
  defineProps<{
    current: Category;
    counts: Record<Category, number>;
    // The detail page places the segments inside the receded sheet and the sidebar outside it.
    part?: "both" | "segmented" | "sidebar";
  }>(),
  { part: "both" },
);
const locale = useLocale();
const t = useT();
const items = computed(() =>
  categories.map((category) => ({
    category,
    to: localizePath(`/works/${category}`, locale.value),
    label: t.value(`works.${category}`),
    active: category === props.current,
  })),
);
</script>

<template>
  <!-- Mobile: one row of segments under the sheet heading. -->
  <nav v-if="part !== 'sidebar'" class="segmented" :aria-label="t('works.label')">
    <LayoutGroup id="works-segmented">
      <NuxtLink
        v-for="item in items"
        :key="item.category"
        :to="item.to"
        class="segment text-callout"
        :class="item.active ? 'font-bold text-bg' : 'text-muted'"
        :aria-current="item.active ? 'page' : undefined"
        data-cursor="block"
      >
        <SelectionMark v-if="item.active" id="segment-mark" class="bg-fg" />
        {{ item.label }}
      </NuxtLink>
    </LayoutGroup>
  </nav>

  <!-- Desktop: a card fixed at the vertical centre of the left edge. -->
  <nav v-if="part !== 'segmented'" class="sidebar" :aria-label="t('works.label')">
    <LayoutGroup id="works-sidebar">
      <NuxtLink
        v-for="item in items"
        :key="item.category"
        :to="item.to"
        class="side-item"
        :class="item.active ? 'text-bg' : 'text-fg'"
        :aria-current="item.active ? 'page' : undefined"
        data-cursor="block"
      >
        <SelectionMark v-if="item.active" id="side-mark" class="bg-fg" />
        <span class="text-headline">{{ item.label }}</span>
        <span class="text-caption" :class="item.active ? 'text-bg' : 'text-muted'">{{
          counts[item.category]
        }}</span>
      </NuxtLink>
    </LayoutGroup>
  </nav>
</template>

<style scoped>
.segmented {
  display: flex;
  gap: 2px;
  height: 40px;
  padding: 4px;
  border-radius: var(--ut-radius-full);
  background: var(--ut-color-fill);
}

.segment {
  position: relative;
  isolation: isolate;
  display: grid;
  flex: 1;
  place-items: center;
  border-radius: var(--ut-radius-full);
  transition:
    background-color var(--ut-duration-base) var(--ut-ease-out),
    color var(--ut-duration-base) var(--ut-ease-out),
    scale var(--ut-duration-fast) var(--ut-ease-out);
}

/* Phones: a segment sinks while it is pressed (visual spec §9.5). */
.segment:active {
  scale: 0.92;
}

/* Component styles win over Tailwind utilities here, so visibility is set here too. */
.sidebar {
  display: none;
}

@media (width >= 64rem) {
  .segmented {
    display: none;
  }

  .sidebar {
    display: flex;
  }
}

.sidebar {
  position: fixed;
  top: 50%;
  left: 32px;
  z-index: 15;
  flex-direction: column;
  gap: 4px;
  width: 216px;
  padding: 4px;
  translate: 0 -50%;
  border: 1px solid var(--ut-color-border);
  border-radius: var(--ut-radius-card);
  background: var(--ut-color-surface);
}

.side-item {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  border-radius: var(--ut-radius-row);
  transition:
    background-color var(--ut-duration-base) var(--ut-ease-out),
    color var(--ut-duration-base) var(--ut-ease-out);
}
</style>
