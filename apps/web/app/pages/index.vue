<script setup lang="ts">
// On Vercel, "/" is routed by vercel.json before this page is reached. Elsewhere (preview, other hosts)
// this static redirect sends visitors to the default language.
import { navigateTo } from "#imports";
import { defaultLocale, localizePath } from "~/i18n/config";

await navigateTo(localizePath("/", defaultLocale), { redirectCode: 302 });
</script>

<template>
  <div />
</template>
