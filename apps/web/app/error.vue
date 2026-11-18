<script setup lang="ts">
import NotFound from "~/components/NotFound.vue";
import SiteShell from "~/components/SiteShell.vue";
import { useT } from "~/composables/use-locale";
import { usePageMeta } from "~/composables/use-page-meta";

const t = useT();
usePageMeta({ title: () => t.value("notFound.title"), indexable: false });
</script>

<template>
  <SiteShell section="not-found">
    <NotFound />
  </SiteShell>
</template>
