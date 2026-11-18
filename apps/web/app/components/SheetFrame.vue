<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { RECEDE } from "@ut42tech/tokens/motion";
import { detailProgress, sheetProgress } from "~/composables/use-sheet";

const emit = defineEmits<{ drag: [event: PointerEvent] }>();
const el = ref<HTMLElement>();
defineExpose({ el });

// The CSS turns these into the sheet's position on phones and ignores them on wide screens.
const setPosition = (value: number) =>
  el.value?.style.setProperty("--sheet-progress", String(value));
// Pushed back behind the app detail as it opens: narrower on each side, top edge lifted. Nothing behind
// needs `inert`: the detail opens as a modal dialog, which makes the rest of the page inert on its own.
function setRecede(value: number) {
  const amount = Math.min(Math.max(value, 0), 1);
  const scale = 1 - ((2 * RECEDE.insetPx) / window.innerWidth) * amount;
  el.value?.style.setProperty("--recede-scale", String(scale));
  el.value?.style.setProperty("--recede-lift", `${RECEDE.liftPx * amount}px`);
}

const stops: (() => void)[] = [];
onMounted(() => {
  setPosition(sheetProgress.get());
  setRecede(detailProgress.get());
  stops.push(sheetProgress.on("change", setPosition), detailProgress.on("change", setRecede));
});
onBeforeUnmount(() => stops.forEach((stop) => stop()));

// The grabber and the page heading are handles; the rest of the sheet scrolls.
function onPointerDown(event: PointerEvent) {
  if ((event.target as Element).closest("[data-sheet-handle]")) emit("drag", event);
}
</script>

<template>
  <section ref="el" class="sheet" @pointerdown="onPointerDown">
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
  transform-origin: top center;
  translate: 0 calc((1 - var(--sheet-progress, 1)) * 100% - var(--recede-lift, 0px));
  scale: var(--recede-scale, 1);
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
    scale: none;
  }

  .grabber-row {
    display: none;
  }
}
</style>
