<script setup lang="ts">
import { brandIcons, type BrandIconName } from "../lib/icons";

defineProps<{ name: BrandIconName; size: number }>();
</script>

<!-- The shape data comes from the simple-icons package; this only draws it at the requested size. -->
<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="brandIcons[name].path" />
  </svg>
</template>
