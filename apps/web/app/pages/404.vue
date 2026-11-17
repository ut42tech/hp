<script setup lang="ts">
import { definePageMeta } from "#imports";
import NotFound from "~/components/NotFound.vue";
import { useT } from "~/composables/use-locale";
import { usePageMeta } from "~/composables/use-page-meta";

// Written to 404.html at build time (nuxt.config.ts); the host serves it for any missing URL.
definePageMeta({ section: "not-found" });
const t = useT();
usePageMeta({ title: () => t.value("notFound.title"), indexable: false });
</script>

<template>
  <NotFound />
</template>
