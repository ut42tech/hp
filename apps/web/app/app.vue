<script setup lang="ts">
import { computed } from "vue";
import { NuxtPage } from "#components";
import { useRouter } from "#imports";
import SheetFrame from "~/components/SheetFrame.vue";
import SiteShell from "~/components/SiteShell.vue";
import { sectionOf, type Section } from "~/lib/section";

// Read the router directly (not useRoute()): the shell follows the address as soon as it changes.
const router = useRouter();
const section = computed(() => {
  const { meta, path } = router.currentRoute.value;
  return (meta.section as Section | undefined) ?? sectionOf(path);
});
const hasSheet = computed(() => ["about", "works", "press"].includes(section.value));
</script>

<template>
  <SiteShell :section="section">
    <SheetFrame v-if="hasSheet">
      <NuxtPage />
    </SheetFrame>
    <NuxtPage v-else />
  </SiteShell>
</template>
