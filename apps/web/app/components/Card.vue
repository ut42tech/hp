<script setup lang="ts">
import { computed } from "vue";
import { NuxtLink } from "#components";
import type { Locale } from "~/i18n/config";
import type { BrandIconName } from "~/lib/icons";
import Thumb from "./Thumb.vue";
import UiIcon from "./UiIcon.vue";

const props = defineProps<{
  to?: string;
  external?: boolean;
  title: string;
  meta: string;
  image?: string;
  initial: string;
  brand?: BrandIconName;
  // Set when the entry fell back to another language than the page's.
  lang?: Locale;
}>();

const tag = computed(() => (!props.to ? "div" : props.external ? "a" : NuxtLink));
const linkProps = computed(() => {
  if (!props.to) return {};
  if (props.external)
    return { href: props.to, target: "_blank", rel: "noopener", "data-cursor": "block" };
  return { to: props.to, "data-cursor": "block" };
});
</script>

<template>
  <component :is="tag" class="card" :lang="lang" v-bind="linkProps">
    <Thumb
      :src="image"
      alt=""
      :initial="initial"
      :brand="brand"
      sizes="360px lg:264px"
      class="aspect-[16/10]"
    />
    <div class="flex flex-col gap-1 p-3">
      <p class="title text-card-title text-fg">{{ title }}</p>
      <div class="flex items-center gap-2 text-muted">
        <p class="meta min-w-0 flex-1 truncate text-mono">{{ meta }}</p>
        <UiIcon v-if="to && external" name="arrow-up-right" :size="14" />
      </div>
    </div>
  </component>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--ut-color-border);
  border-radius: var(--ut-radius-card);
  background: var(--ut-color-surface);
  overflow-wrap: anywhere;
}

/* Titles reserve two lines so every card in a row has the same height. */
.title {
  display: -webkit-box;
  min-height: 40px;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
</style>
