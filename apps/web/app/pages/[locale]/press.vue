<script setup lang="ts">
import { REORDER_SPRING } from "@ut42tech/tokens/motion";
import { motion } from "motion-v";
import { computed, ref } from "vue";
import Card from "~/components/Card.vue";
import PageHead from "~/components/PageHead.vue";
import { useLocale, useT } from "~/composables/use-locale";
import { usePageMeta } from "~/composables/use-page-meta";
import { useWorks } from "~/composables/use-works";
import type { BrandIconName } from "~/lib/icons";
import { formatMonth, initialOf, sortByDate, type SortOrder } from "~/lib/works";

const locale = useLocale();
const t = useT();
usePageMeta({ title: () => t.value("press.title") });

const items = await useWorks("press", locale);
const order = ref<SortOrder>("newest");
const sorted = computed(() => sortByDate(items.value, (entry) => entry.date, order.value));
// Known sources show their brand mark when there is no thumbnail; others fall back to an initial.
const brandOf = (source: string): BrandIconName | undefined =>
  source === "other" ? undefined : (source as BrandIconName);
</script>

<template>
  <div class="press flex flex-col gap-4 lg:gap-6">
    <PageHead
      v-model:order="order"
      :title="t('press.title')"
      :count="items.length"
      sort-list="press-list"
      handle
    />
    <ul id="press-list" class="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
      <!-- Re-sorting slides each card to its new place (Motion layout). -->
      <motion.li
        v-for="entry in sorted"
        :key="entry.slug"
        layout
        :transition="{ layout: REORDER_SPRING }"
      >
        <Card
          :to="entry.url"
          external
          :title="entry.title"
          :meta="`${formatMonth(entry.date)} · ${entry.outlet}`"
          :image="entry.thumbnail"
          :initial="initialOf(entry.outlet)"
          :brand="brandOf(entry.source)"
          :lang="entry.lang === locale ? undefined : entry.lang"
        />
      </motion.li>
    </ul>
  </div>
</template>

<style scoped>
@media (width >= 64rem) {
  .press {
    width: min(var(--ut-width-content), 100%);
    margin-inline: auto;
  }
}
</style>
