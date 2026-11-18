<script setup lang="ts">
import { SELECTION_SPRING } from "@ut42tech/tokens/motion";
import { motion } from "motion-v";

// The surface behind the selected item. One per navigation (its LayoutGroup), so Motion slides it from the
// previous item to the new one. The colour comes from the caller's class.
defineProps<{ id: string }>();
</script>

<template>
  <motion.span
    :layout-id="id"
    :transition="SELECTION_SPRING"
    class="selection-mark"
    data-indicator
    aria-hidden="true"
  />
</template>

<style scoped>
.selection-mark {
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
}
</style>
