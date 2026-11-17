<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "#imports";
import { useLocale, useT } from "~/composables/use-locale";
import type { Section } from "~/lib/section";
import HelloStage from "./HelloStage.vue";
import NavBar from "./NavBar.vue";
import SiteHeader from "./SiteHeader.vue";

const props = defineProps<{ section: Section }>();
const locale = useLocale();
const t = useT();
const isHello = computed(() => props.section === "hello");

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

useHead({
  htmlAttrs: { lang: locale },
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" }],
  script: [{ innerHTML: themeScript, tagPosition: "head" }],
});
</script>

<template>
  <a
    href="#content"
    class="sr-only-until-focus fixed top-2 left-2 z-50 bg-surface p-2"
    data-cursor="block"
  >
    {{ t("skip") }}
  </a>
  <SiteHeader />
  <HelloStage v-if="!isHello" decorative />
  <main id="content" :data-section="section">
    <HelloStage v-if="isHello" />
    <slot />
  </main>
  <NavBar :current="section" />
</template>
