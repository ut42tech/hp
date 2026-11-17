<script setup lang="ts">
import { useT } from "~/composables/use-locale";
import { nextOrder, type SortOrder } from "~/lib/works";
import UiIcon from "./UiIcon.vue";

// `list` is the id of the list this button reorders.
defineProps<{ list: string }>();
const order = defineModel<SortOrder>("order", { required: true });
const t = useT();
</script>

<template>
  <button
    type="button"
    class="sort-button text-callout font-bold text-fg"
    :aria-controls="list"
    data-cursor="block"
    @click="order = nextOrder(order)"
  >
    <UiIcon name="arrows-sort" :size="14" />
    <span>{{ t(`sort.${order}`) }}</span>
  </button>
</template>

<style scoped>
.sort-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 16px 0 12px;
  border: 1px solid var(--ut-color-border);
  border-radius: var(--ut-radius-full);
  transition: scale var(--ut-duration-fast) var(--ut-ease-out);
}

/* Phones: a button sinks while it is pressed (visual spec §9.5). */
@media (width < 64rem) {
  .sort-button:active {
    scale: 0.92;
  }
}
</style>
