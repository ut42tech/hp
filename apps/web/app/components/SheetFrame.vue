<script setup lang="ts">
// Pushed back behind a sheet stacked on top of it (mobile app detail). Nothing behind needs `inert`:
// the detail opens as a modal dialog, which makes the rest of the page inert on its own.
defineProps<{ receded?: boolean }>();
</script>

<template>
  <section class="sheet" :class="{ 'is-receded': receded }">
    <div class="grabber-row" aria-hidden="true">
      <span class="grabber" />
    </div>
    <slot />
  </section>
</template>

<style scoped>
/* Mobile: a surface that rises over Hello and scrolls on its own. */
.sheet {
  position: fixed;
  inset: var(--sheet-top) 0 0;
  z-index: 10;
  overflow-y: auto;
  overscroll-behavior: contain;
  /* On tablets the content keeps the reading width instead of stretching. */
  padding: 0 max(var(--gutter-right), calc((100% - var(--ut-width-reading)) / 2))
    var(--nav-clearance) max(var(--gutter-left), calc((100% - var(--ut-width-reading)) / 2));
  border-radius: var(--ut-radius-sheet) var(--ut-radius-sheet) 0 0;
  background: var(--ut-color-surface);
  box-shadow: var(--ut-shadow-sheet);
}

.sheet.is-receded {
  inset-inline: 12px;
  top: calc(var(--sheet-top) - 10px);
  overflow: hidden;
}

.grabber-row {
  display: flex;
  justify-content: center;
  padding: 8px 0 16px;
}

.grabber {
  width: 36px;
  height: 5px;
  border-radius: var(--ut-radius-full);
  background: var(--ut-color-border);
}

/* Desktop: no sheet, the content sits on the page below the toolbar. */
@media (width >= 64rem) {
  .sheet {
    position: static;
    overflow: visible;
    padding: 104px 32px 64px;
    border-radius: 0;
    background: none;
    box-shadow: none;
  }

  .grabber-row {
    display: none;
  }
}
</style>
