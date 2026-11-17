<script setup lang="ts">
import { computed, ref } from "vue";
import { NuxtPage } from "#components";
import { useRouter } from "#imports";
import SheetFrame from "~/components/SheetFrame.vue";
import SiteShell from "~/components/SiteShell.vue";
import { useNarrow } from "~/composables/use-narrow";
import { useReducedMotion } from "~/composables/use-reduced-motion";
import { sectionOfRoute, useSheet } from "~/composables/use-sheet";

// Read the router directly (not useRoute()): the shell follows the address as soon as it changes.
const router = useRouter();
const section = computed(() => sectionOfRoute(router.currentRoute.value));
const hasSheet = computed(() => ["about", "works", "press"].includes(section.value));

const frame = ref<InstanceType<typeof SheetFrame>>();
const { shownRoute, startDrag } = useSheet(() => frame.value?.el);

// On phones the sheet itself moves between tabs; elsewhere the page swaps in place.
const narrow = useNarrow();
const reduced = useReducedMotion();
const pageTransition = computed(() =>
  narrow.value && !reduced.value ? false : { name: "swap", mode: "out-in" as const },
);
</script>

<template>
  <SiteShell :section="section">
    <SheetFrame v-if="shownRoute" ref="frame" @drag="startDrag">
      <NuxtPage :route="shownRoute" :transition="pageTransition" />
    </SheetFrame>
    <!-- Hello and 404 have no sheet; their page only declares the head. -->
    <NuxtPage v-if="!hasSheet" />
  </SiteShell>
</template>
