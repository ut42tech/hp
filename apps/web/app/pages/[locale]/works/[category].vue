<script setup lang="ts">
import { computed } from "vue";
import { NuxtPage } from "#components";
import { createError, definePageMeta, navigateTo, useRoute } from "#imports";
import AppDetail from "~/components/AppDetail.vue";
import PageHead from "~/components/PageHead.vue";
import WorksList from "~/components/WorksList.vue";
import WorksNav from "~/components/WorksNav.vue";
import { useLocale, useT } from "~/composables/use-locale";
import { usePageMeta } from "~/composables/use-page-meta";
import { useWorkCounts, useWorks } from "~/composables/use-works";
import { localizePath } from "~/i18n/config";
import { categories, type Category } from "~/lib/works";

definePageMeta({
  validate: (route) => categories.includes(route.params.category as Category),
});

const route = useRoute();
const category = route.params.category as Category;
const locale = useLocale();
const t = useT();
const counts = await useWorkCounts(locale);
const apps = await useWorks("apps", locale);
const detail = computed(() =>
  route.params.slug ? apps.value.find((entry) => entry.slug === route.params.slug) : undefined,
);
// With an app detail open, the detail's title is the page heading.
const hasDetail = computed(() => Boolean(route.params.slug));
if (hasDetail.value && !detail.value) throw createError({ statusCode: 404, fatal: true });
usePageMeta({ title: () => detail.value?.title ?? t.value(`works.${category}`) });

function closeDetail() {
  return navigateTo(localizePath("/works/apps", locale.value));
}
</script>

<template>
  <div class="flex flex-col gap-3 lg:gap-0">
    <PageHead :title="t('nav.works')" :as="hasDetail ? 'h2' : 'h1'" show="mobile" />
    <WorksNav :current="category" :counts="counts" />
    <div class="works-region" :class="{ 'has-detail': hasDetail }">
      <div class="works-column">
        <WorksList :category="category" />
      </div>
    </div>
    <div v-if="detail" class="detail-region">
      <div class="detail-column">
        <AppDetail :entry="detail" @close="closeDetail" />
      </div>
    </div>
    <NuxtPage />
  </div>
</template>

<style scoped>
.works-region {
  margin-top: 4px;
}

/* Desktop: centre the content between the sidebar's right edge (248px) and the window's right edge. */
@media (width >= 64rem) {
  .works-region {
    margin: 0 -32px 0 216px;
  }

  .works-column {
    width: min(var(--ut-width-content), 100% - 64px);
    margin-inline: auto;
  }

  /* The detail replaces the list in the page flow; the sidebar stays. */
  .works-region.has-detail {
    display: none;
  }

  .detail-region {
    margin: 0 -32px 0 216px;
  }

  .detail-column {
    width: min(var(--ut-width-reading), 100% - 64px);
    margin-inline: auto;
  }
}
</style>
