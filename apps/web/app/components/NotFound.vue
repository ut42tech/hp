<script setup lang="ts">
import { NuxtLink } from "#components";
import { useLocale, useT } from "~/composables/use-locale";
import { localizePath } from "~/i18n/config";
import UiIcon from "./UiIcon.vue";

const locale = useLocale();
const t = useT();
</script>

<template>
  <!-- Same ground as Hello, so a wrong URL still feels like the site; the nav bar leads on from here. -->
  <div class="not-found">
    <p class="text-display text-fg" aria-hidden="true">{{ t("notFound.code") }}</p>
    <h1 class="mt-4 text-callout text-muted lg:mt-5">{{ t("notFound.title") }}</h1>
    <NuxtLink
      :to="localizePath('/', locale)"
      class="home text-callout font-bold"
      data-cursor="block"
    >
      <UiIcon name="chevron-left" :size="14" />
      {{ t("notFound.home") }}
    </NuxtLink>
  </div>
</template>

<style scoped>
.not-found {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-inline: 16px;
  text-align: center;
}

.home {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  margin-top: 24px;
  padding: 0 16px 0 12px;
  border-radius: var(--ut-radius-full);
  background: var(--ut-color-fill);
  color: var(--ut-color-fg);
}
</style>
