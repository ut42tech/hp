<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
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

// On phones the sheet itself moves between tabs; elsewhere the page swaps in place. Coming from Hello the
// sheet's page is new, so it "appears" with the same swap; never on the first paint (mounted).
const narrow = useNarrow();
const reduced = useReducedMotion();
const mounted = ref(false);
onMounted(() => (mounted.value = true));
const pageTransition = computed(() =>
  narrow.value && !reduced.value
    ? false
    : { name: "swap", mode: "out-in" as const, appear: mounted.value },
);
// Wide screens: going back to Hello, the page fades out instead of vanishing.
const frameTransition = computed(() => (narrow.value ? undefined : "sheet-fade"));
</script>

<template>
  <SiteShell :section="section">
    <Transition :name="frameTransition">
      <SheetFrame v-if="shownRoute" ref="frame" @drag="startDrag">
        <NuxtPage :route="shownRoute" :transition="pageTransition" />
      </SheetFrame>
    </Transition>
    <!-- Hello and 404 have no sheet; their page only declares the head. -->
    <NuxtPage v-if="!hasSheet" />
  </SiteShell>
</template>
