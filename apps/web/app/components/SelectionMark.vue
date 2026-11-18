<!-- The surface behind the selected item. Its container slides it from the previous item when the selection
     changes (composables/use-sliding-mark.ts). The colour comes from the caller's class. -->
<template>
  <span class="selection-mark" data-indicator aria-hidden="true" />
</template>

<style scoped>
.selection-mark {
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
}
</style>
