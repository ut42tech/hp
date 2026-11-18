<script setup lang="ts">
import { NuxtPage } from "#components";
import { definePageMeta } from "#imports";
import { isLocale, publishedLocales } from "~/i18n/config";

// Only published languages have pages; anything else under /<x>/ is a 404.
definePageMeta({
  validate: (route) => {
    const locale = route.params.locale;
    return isLocale(locale) && publishedLocales.includes(locale);
  },
});
</script>

<template>
  <NuxtPage />
</template>
