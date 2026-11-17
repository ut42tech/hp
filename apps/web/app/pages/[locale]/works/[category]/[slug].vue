<script setup lang="ts">
import { definePageMeta } from "#imports";

// Only Apps have details. The detail itself is drawn by the parent list page, so it can stay on screen
// while it animates out after the address changes.
definePageMeta({ validate: (route) => route.params.category === "apps" });
</script>

<template>
  <div />
</template>
