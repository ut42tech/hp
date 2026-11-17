<script setup lang="ts">
import { UI_ICON_STROKE, uiIcons, type UiIconName } from "../lib/icons";

defineProps<{ name: UiIconName; size: number }>();
</script>

<template>
  <component
    :is="uiIcons[name]"
    :size="size"
    :stroke="UI_ICON_STROKE"
    aria-hidden="true"
    focusable="false"
  />
</template>
