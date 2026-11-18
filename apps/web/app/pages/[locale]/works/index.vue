<script setup lang="ts">
// On Vercel this redirect happens in vercel.json before any page loads; this covers other hosts.
import { navigateTo } from "#imports";
import { useLocale } from "~/composables/use-locale";
import { localizePath } from "~/i18n/config";

const locale = useLocale();
await navigateTo(localizePath("/works/apps", locale.value), { redirectCode: 302 });
</script>

<template>
  <div />
</template>
