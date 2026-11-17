<script setup lang="ts">
import { computed } from "vue";
import { NuxtPage } from "#components";
import { definePageMeta, useRoute } from "#imports";
import PageHead from "~/components/PageHead.vue";
import WorksList from "~/components/WorksList.vue";
import WorksNav from "~/components/WorksNav.vue";
import { useLocale, useT } from "~/composables/use-locale";
import { usePageMeta } from "~/composables/use-page-meta";
import { useWorkCounts } from "~/composables/use-works";
import { categories, type Category } from "~/lib/works";

definePageMeta({
  validate: (route) => categories.includes(route.params.category as Category),
});

const route = useRoute();
const category = route.params.category as Category;
const locale = useLocale();
const t = useT();
const counts = await useWorkCounts(locale);
// With an app detail open, the detail's title is the page heading.
const hasDetail = computed(() => Boolean(route.params.slug));
usePageMeta({ title: () => t.value(`works.${category}`) });
</script>

<template>
  <div class="flex flex-col gap-3 lg:gap-0">
    <PageHead :title="t('nav.works')" :as="hasDetail ? 'h2' : 'h1'" show="mobile" />
    <WorksNav :current="category" :counts="counts" />
    <div class="works-region">
      <div class="works-column">
        <WorksList :category="category" />
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
}
</style>
