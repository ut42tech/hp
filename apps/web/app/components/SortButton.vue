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
    <span class="arrows" :class="{ 'is-oldest': order === 'oldest' }">
      <UiIcon name="arrows-sort" :size="14" />
    </span>
    <!-- The order label turns over like a card: the old one tips away, the new one swings in a little
         past flat and settles back (ease-overshoot). -->
    <span class="label-face">
      <Transition name="flip" mode="out-in">
        <span :key="order" class="label">{{ t(`sort.${order}`) }}</span>
      </Transition>
    </span>
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

.arrows {
  display: grid;
  transition: rotate 360ms var(--ut-ease-overshoot);
}

.arrows.is-oldest {
  rotate: 180deg;
}

.label-face {
  display: inline-grid;
  perspective: 240px;
}

.label {
  backface-visibility: hidden;
}

.flip-leave-active {
  transition:
    transform 120ms var(--ut-ease-in-out),
    opacity 120ms linear;
}

.flip-leave-to {
  transform: rotateX(90deg);
  opacity: 0.4;
}

.flip-enter-active {
  transition: transform 360ms var(--ut-ease-overshoot);
}

.flip-enter-from {
  transform: rotateX(-90deg);
}

/* Reduced motion: the label and the arrows just switch. */
@media (prefers-reduced-motion: reduce) {
  .arrows,
  .flip-leave-active,
  .flip-enter-active {
    transition: none;
  }
}

/* Phones: a button sinks while it is pressed (visual spec §9.5). */
@media (width < 64rem) {
  .sort-button:active {
    scale: 0.92;
  }
}
</style>
