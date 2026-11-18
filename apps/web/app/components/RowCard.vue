<script setup lang="ts">
import type { Locale } from "~/i18n/config";
import Thumb from "./Thumb.vue";

defineProps<{
  title: string;
  period: string;
  summary: string;
  image?: string;
  initial: string;
  lang?: Locale;
}>();
</script>

<template>
  <div class="row-card" :lang="lang">
    <Thumb :src="image" alt="" :initial="initial" sizes="96px lg:160px" class="h-full" />
    <div class="flex min-w-0 flex-col justify-center gap-0.5 pr-4">
      <p class="meta text-mono text-muted">{{ period }}</p>
      <p class="title text-card-title text-fg lg:text-headline">{{ title }}</p>
      <p class="truncate text-callout text-muted">{{ summary }}</p>
    </div>
  </div>
</template>

<style scoped>
.row-card {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 12px;
  height: 100px;
  overflow: hidden;
  border: 1px solid var(--ut-color-border);
  border-radius: var(--ut-radius-row);
  background: var(--ut-color-surface);
  overflow-wrap: anywhere;
}

.title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

@media (width >= 64rem) {
  .row-card {
    grid-template-columns: 160px 1fr;
    gap: 20px;
  }
}
</style>
