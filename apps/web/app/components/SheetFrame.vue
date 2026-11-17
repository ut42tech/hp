<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { sheetProgress } from "~/composables/use-sheet";

// Pushed back behind a sheet stacked on top of it (mobile app detail). Nothing behind needs `inert`:
// the detail opens as a modal dialog, which makes the rest of the page inert on its own.
defineProps<{ receded?: boolean }>();
const emit = defineEmits<{ drag: [event: PointerEvent] }>();
const el = ref<HTMLElement>();
defineExpose({ el });

// The CSS turns this into the sheet's position on phones and ignores it on wide screens.
let stop: (() => void) | undefined;
onMounted(() => {
  const set = (value: number) => el.value?.style.setProperty("--sheet-progress", String(value));
  set(sheetProgress.get());
  stop = sheetProgress.on("change", set);
});
onBeforeUnmount(() => stop?.());

// The grabber and the page heading are handles; the rest of the sheet scrolls.
function onPointerDown(event: PointerEvent) {
  if ((event.target as Element).closest("[data-sheet-handle]")) emit("drag", event);
}
</script>

<template>
  <section ref="el" class="sheet" :class="{ 'is-receded': receded }" @pointerdown="onPointerDown">
    <div class="grabber-row" aria-hidden="true" data-sheet-handle>
      <span class="grabber" />
    </div>
    <slot />
  </section>
</template>

<style scoped>
/* Mobile: a surface that rises over Hello and scrolls on its own. It reaches 80px below the screen
   so a spring that settles a hair past fully open never shows a gap under it. */
.sheet {
  position: fixed;
  inset: var(--sheet-top) 0 -80px;
  z-index: 10;
  overflow-y: auto;
  overscroll-behavior: contain;
  /* On tablets the content keeps the reading width instead of stretching. */
  padding: 0 max(var(--gutter-right), calc((100% - var(--ut-width-reading)) / 2))
    calc(var(--nav-clearance) + 80px)
    max(var(--gutter-left), calc((100% - var(--ut-width-reading)) / 2));
  border-radius: var(--ut-radius-sheet) var(--ut-radius-sheet) 0 0;
  background: var(--ut-color-surface);
  box-shadow: var(--ut-shadow-sheet);
  translate: 0 calc((1 - var(--sheet-progress, 1)) * 100%);
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
    translate: none;
  }

  .grabber-row {
    display: none;
  }
}
</style>
