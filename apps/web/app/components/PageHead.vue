<script setup lang="ts">
import { computed } from "vue";
import { useT } from "~/composables/use-locale";
import type { SortOrder } from "~/lib/works";
import SortButton from "./SortButton.vue";

const props = withDefaults(
  defineProps<{
    title: string;
    as?: "h1" | "h2";
    // Where the heading is visible; elsewhere it stays available to screen readers.
    show?: "both" | "mobile" | "desktop";
    count?: number;
    // Id of the list the sort button reorders; the button appears when this is set.
    sortList?: string;
    // The sheet's top heading: on phones, dragging it moves the sheet.
    handle?: boolean;
  }>(),
  { as: "h1", show: "both", count: undefined, sortList: undefined, handle: false },
);
const order = defineModel<SortOrder>("order", { default: "newest" });
const t = useT();
const hasMeta = computed(() => props.count !== undefined || props.sortList !== undefined);
</script>

<template>
  <div class="page-head" :data-sheet-handle="handle || undefined">
    <component
      :is="as"
      class="text-title-l text-fg"
      :class="{ 'lg:sr-only': show === 'mobile', 'max-lg:sr-only': show === 'desktop' }"
    >
      {{ title }}
    </component>
    <div v-if="hasMeta" class="meta-row">
      <span v-if="count !== undefined" class="count text-caption text-muted">{{
        t("count", { n: count })
      }}</span>
      <SortButton v-if="sortList" v-model:order="order" :list="sortList" />
    </div>
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (width >= 64rem) {
  .page-head {
    flex-direction: row;
    align-items: baseline;
  }

  .meta-row {
    display: contents;
  }

  .count {
    margin-right: auto;
  }

  .meta-row :deep(.sort-button) {
    align-self: center;
  }
}
</style>
