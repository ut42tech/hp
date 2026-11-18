<script setup lang="ts">
import { MotionConfig } from "motion-v";
import { computed } from "vue";
import { useHead } from "#imports";
import { useLocale, useT } from "~/composables/use-locale";
import type { Section } from "~/lib/section";
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

// Sets the theme before first paint. Keep the key and rules in sync with app/lib/theme.ts.
const themeScript = `(() => {
  const key = "ut42tech:theme";
  const media = matchMedia("(prefers-color-scheme: dark)");
  const apply = () => {
    let stored = null;
    try {
      stored = localStorage.getItem(key);
    } catch {}
    const pref = stored === "light" || stored === "dark" ? stored : "auto";
    const root = document.documentElement;
    root.dataset.theme = pref === "auto" ? (media.matches ? "dark" : "light") : pref;
    // Read by components/ThemeToggle.vue's CSS to show the right icon before it hydrates.
    root.dataset.themePref = pref;
  };
  apply();
  media.addEventListener("change", apply);
})();`;

// Decides before first paint whether this load shows the entrance (html[data-intro]); the gate runs from its
// own source text, so the logic is the one the tests cover.
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
