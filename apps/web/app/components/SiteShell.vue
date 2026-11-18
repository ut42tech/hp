<script setup lang="ts">
import { MotionConfig } from "motion-v";
import { computed } from "vue";
import { useHead } from "#imports";
import { useLocale, useT } from "~/composables/use-locale";
import type { Section } from "~/lib/section";
import { themeGate } from "~/lib/theme";
import { useNarrow } from "~/composables/use-narrow";
import { introGate } from "~/motion/intro-gate";
import HelloStage from "./HelloStage.vue";
import IntroCurtain from "./IntroCurtain.vue";
import NavBar from "./NavBar.vue";
import SiteHeader from "./SiteHeader.vue";

const props = defineProps<{ section: Section }>();
const locale = useLocale();
const t = useT();
const isHello = computed(() => props.section === "hello");
const narrow = useNarrow();
// The greeting stays behind the sheets; the 404 stands on the Hello ground itself, so it gets none.
const behindSheets = computed(() => !isHello.value && props.section !== "not-found");

// Two gates run inline in <head> before first paint, each from its own source text, so the logic is the one
// the tests cover. Storage access itself can throw (blocked site data); the gates then get none.
// The theme (html[data-theme], also what ThemeToggle.vue's icon follows before it hydrates):
const themeScript = `(() => {
  let storage;
  try {
    storage = localStorage;
  } catch {}
  (${themeGate.toString()})(document.documentElement, storage, matchMedia("(prefers-color-scheme: dark)"));
})();`;

// Whether this load shows the entrance (html[data-intro]):
const introScript = `(() => {
  let storage;
  try {
    storage = sessionStorage;
  } catch {}
  const mode = (${introGate.toString()})(storage, matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (mode !== "none") document.documentElement.dataset.intro = mode;
})();`;

useHead({
  htmlAttrs: { lang: locale },
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" }],
  script: [
    { innerHTML: themeScript, tagPosition: "head" },
    { innerHTML: introScript, tagPosition: "head" },
  ],
});
</script>

<template>
  <!-- With "reduce motion", Motion skips movement (re-sorted lists sliding) and keeps fades. -->
  <MotionConfig reduced-motion="user">
    <a
      href="#content"
      class="sr-only-until-focus fixed top-2 left-2 z-50 bg-surface p-2"
      data-cursor="block"
    >
      {{ t("skip") }}
    </a>
    <SiteHeader />
    <HelloStage v-if="behindSheets" decorative />
    <main id="content" :data-section="section">
      <!-- Wide screens: the greeting swaps like a page when you leave or come back to Hello. -->
      <Transition :name="narrow ? undefined : 'swap'">
        <HelloStage v-if="isHello" />
      </Transition>
      <slot />
    </main>
    <NavBar :current="section" />
    <IntroCurtain />
  </MotionConfig>
</template>
