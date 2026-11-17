<script setup lang="ts">
import { NuxtImg } from "#components";
import type { BrandIconName } from "~/lib/icons";
import BrandIcon from "./BrandIcon.vue";

defineProps<{
  src?: string;
  alt: string;
  initial: string;
  brand?: BrandIconName;
  // Rendered widths per screen, in Nuxt Image's form, e.g. "50vw lg:264px".
  sizes: string;
}>();
</script>

<template>
  <div class="thumb">
    <NuxtImg v-if="src" :src="src" :alt="alt" :sizes="sizes" class="size-full object-cover" />
    <div v-else class="grid size-full place-items-center text-muted" aria-hidden="true">
      <BrandIcon v-if="brand" :name="brand" :size="32" />
      <span v-else class="text-title-m">{{ initial }}</span>
    </div>
  </div>
</template>

<style scoped>
.thumb {
  overflow: hidden;
  background: var(--ut-color-placeholder);
}
</style>
