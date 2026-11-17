<script setup lang="ts">
import { computed, ref } from "vue";
import { useLocale, useT } from "~/composables/use-locale";
import { useWorks } from "~/composables/use-works";
import { localizePath, type Locale } from "~/i18n/config";
import {
  formatMonth,
  formatPeriod,
  initialOf,
  sortByDate,
  type Category,
  type SortOrder,
} from "~/lib/works";
import Card from "./Card.vue";
import PageHead from "./PageHead.vue";
import RowCard from "./RowCard.vue";

const props = defineProps<{ category: Category }>();
const locale = useLocale();
const t = useT();
const entries = await useWorks(props.category, locale);
const order = ref<SortOrder>("newest");

interface Item {
  key: string;
  title: string;
  meta: string;
  initial: string;
  image?: string;
  to?: string;
  external?: boolean;
  summary?: string;
  // Set when the entry fell back to another language, so screen readers pronounce it correctly.
  lang?: Locale;
}

const items = computed<Item[]>(() =>
  sortByDate(
    entries.value,
    (entry) => ("start" in entry ? entry.start : entry.date),
    order.value,
  ).map((entry) => {
    const base = {
      key: entry.slug,
      title: entry.title,
      initial: initialOf(entry.title, "initial" in entry ? entry.initial : undefined),
      image: "thumbnail" in entry ? entry.thumbnail : undefined,
      lang: entry.lang === locale.value ? undefined : entry.lang,
    };
    if ("start" in entry)
      return { ...base, meta: formatPeriod(entry.start, entry.end), summary: entry.summary };
    const meta = formatMonth(entry.date);
    if (props.category === "apps")
      return { ...base, meta, to: localizePath(`/works/apps/${entry.slug}`, locale.value) };
    if ("url" in entry && entry.url) return { ...base, meta, to: entry.url, external: true };
    return { ...base, meta };
  }),
);
</script>

<template>
  <div class="flex flex-col gap-4 lg:gap-6">
    <PageHead
      v-model:order="order"
      :title="t(`works.${category}`)"
      as="h2"
      show="desktop"
      :count="items.length"
      sort-list="works-list"
    />
    <ul v-if="category === 'career'" id="works-list" class="flex flex-col gap-3">
      <li v-for="item in items" :key="item.key">
        <RowCard
          :title="item.title"
          :period="item.meta"
          :summary="item.summary ?? ''"
          :image="item.image"
          :initial="item.initial"
          :lang="item.lang"
        />
      </li>
    </ul>
    <ul v-else id="works-list" class="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
      <li v-for="item in items" :key="item.key">
        <Card
          :to="item.to"
          :external="item.external"
          :title="item.title"
          :meta="item.meta"
          :image="item.image"
          :initial="item.initial"
          :lang="item.lang"
        />
      </li>
    </ul>
  </div>
</template>
