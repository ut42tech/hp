<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ContentRenderer, NuxtLink } from "#components";
import { useLocale, useT } from "~/composables/use-locale";
import { useNarrow } from "~/composables/use-narrow";
import { detailProgress } from "~/composables/use-sheet";
import type { WorkEntry } from "~/composables/use-works";
import { localizePath } from "~/i18n/config";
import { brandIcons } from "~/lib/icons";
import type { Localized } from "~/lib/localized";
import { formatMonth, initialOf } from "~/lib/works";
import { applySheetMode } from "~/motion/dialog-mode";
import { isPlainClick } from "~/motion/history";
import BrandIcon from "./BrandIcon.vue";
import Thumb from "./Thumb.vue";
import UiIcon from "./UiIcon.vue";

const props = defineProps<{ entry: Localized<WorkEntry<"apps">> }>();
const emit = defineEmits<{ close: []; drag: [event: PointerEvent, sheet: HTMLDialogElement] }>();
const locale = useLocale();
const t = useT();
const narrow = useNarrow();
const dialog = ref<HTMLDialogElement>();
const listHref = () => localizePath("/works/apps", locale.value);
const links = () =>
  [
    { kind: "demo", href: props.entry.demo, label: t.value("detail.demo") },
    { kind: "github", href: props.entry.github, label: t.value("detail.github") },
  ].filter((link): link is { kind: string; href: string; label: string } => Boolean(link.href));

// The CSS turns this into the sheet's position and the scrim on phones, and ignores it on wide screens.
const setProgress = (value: number) =>
  dialog.value?.style.setProperty("--detail-progress", String(value));
let stopProgress: (() => void) | undefined;
onBeforeUnmount(() => stopProgress?.());

// The mode follows the width, so rotating a tablet or resizing a window across 1024px stays correct.
onMounted(() => {
  setProgress(detailProgress.get());
  stopProgress = detailProgress.on("change", setProgress);
  watch(
    narrow,
    (isNarrow) => {
      if (!dialog.value) return;
      applySheetMode(dialog.value, isNarrow);
      // Start on the sheet, not its first control, so nothing opens with a focus ring.
      if (isNarrow) dialog.value.focus();
    },
    { immediate: true },
  );
});

// The grabber and the image drag the sheet; the rest scrolls.
function onHandle(event: PointerEvent) {
  if (dialog.value) emit("drag", event, dialog.value);
}

// The "back" capsule closes like every other way out (back or replace, so history does not grow);
// without JavaScript, or with a modified click, it stays a plain link to the list. Capture runs before
// NuxtLink's own click handler, which would otherwise navigate first.
function onBack(event: MouseEvent) {
  if (!isPlainClick(event)) return;
  event.preventDefault();
  emit("close");
}

function onCancel(event: Event) {
  event.preventDefault();
  emit("close");
}
</script>

<template>
  <dialog
    ref="dialog"
    open
    class="app-detail"
    aria-labelledby="app-detail-title"
    tabindex="-1"
    :lang="entry.lang === locale ? undefined : entry.lang"
    @cancel="onCancel"
  >
    <div class="grabber-row" aria-hidden="true" data-sheet-handle @pointerdown="onHandle">
      <span class="grabber" />
    </div>
    <button
      type="button"
      class="sr-only"
      data-close
      :aria-label="t('detail.close')"
      data-cursor="block"
      @click="emit('close')"
    />
    <div class="top-row">
      <NuxtLink
        :to="listHref()"
        class="back text-callout font-bold"
        data-cursor="block"
        @click.capture="onBack"
      >
        <UiIcon name="chevron-left" :size="14" />
        {{ t("detail.back") }}
      </NuxtLink>
    </div>

    <Thumb
      data-sheet-handle
      :src="entry.thumbnail"
      alt=""
      :initial="initialOf(entry.title, entry.initial)"
      sizes="720px"
      class="aspect-[16/10] rounded-card"
      @pointerdown="onHandle"
    />

    <p class="mt-5 text-mono text-muted">{{ formatMonth(entry.date) }} · {{ t("works.apps") }}</p>
    <h1 id="app-detail-title" class="mt-2 text-title-l text-fg">{{ entry.title }}</h1>
    <div class="prose mt-2 text-body text-fg">
      <ContentRenderer :value="entry" />
    </div>

    <div v-if="links().length > 0" class="mt-4 flex gap-2">
      <a
        v-for="link in links()"
        :key="link.kind"
        :href="link.href"
        target="_blank"
        rel="noopener"
        class="link-button text-callout font-bold"
        :class="link.kind === 'demo' ? 'is-primary' : 'is-secondary'"
        :data-link="link.kind"
        data-cursor="block"
      >
        {{ link.label }}
        <UiIcon name="arrow-up-right" :size="14" />
      </a>
    </div>

    <section v-if="entry.stack?.length" class="mt-5">
      <h2 class="text-mono text-muted">{{ t("detail.stack") }}</h2>
      <ul class="mt-2 flex flex-wrap gap-3">
        <li
          v-for="skill in entry.stack"
          :key="skill"
          class="tile"
          role="img"
          :aria-label="brandIcons[skill].title"
          :title="brandIcons[skill].title"
        >
          <BrandIcon :name="skill" :size="22" />
        </li>
      </ul>
    </section>
  </dialog>
</template>

<style scoped>
/* Mobile: a second sheet stacked over the Works sheet and above the nav bar. It reaches 80px below the
   screen so a spring that settles a hair past fully open never shows a gap under it. */
.app-detail {
  position: fixed;
  inset: var(--sheet-top) 0 -80px;
  z-index: 40;
  width: 100%;
  max-width: none;
  height: auto;
  max-height: none;
  margin: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 max(var(--gutter-right), calc((100% - var(--ut-width-reading)) / 2))
    calc(var(--bottom-inset) + 24px + 80px)
    max(var(--gutter-left), calc((100% - var(--ut-width-reading)) / 2));
  border: 0;
  border-radius: var(--ut-radius-sheet) var(--ut-radius-sheet) 0 0;
  background: var(--ut-color-surface);
  color: inherit;
  box-shadow: var(--ut-shadow-sheet);
  translate: 0 calc((1 - var(--detail-progress, 1)) * 100%);
}

/* Opening moves focus to the sheet itself, not to the close button; no ring for that. */
.app-detail:focus-visible {
  outline: none;
}

/* The backdrop is not a scroll container by default, so without these, scrolling over it moves the
   page behind the sheet. */
.app-detail::backdrop {
  overflow: hidden;
  overscroll-behavior: contain;
  background: var(--ut-color-scrim);
  /* The scrim deepens as the sheet rises (::backdrop reads the dialog's custom properties). */
  opacity: clamp(0, var(--detail-progress, 1), 1);
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

/* Phones close the sheet by swiping it down; the "back" capsule is for wide screens. */
.top-row {
  display: none;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 16px 0 12px;
  border-radius: var(--ut-radius-full);
  background: var(--ut-color-fill);
}

.prose :deep(p + p) {
  margin-top: 1em;
}

.link-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border-radius: var(--ut-radius-full);
}

.link-button.is-primary {
  background: var(--ut-color-fg);
  color: var(--ut-color-bg);
}

.link-button.is-secondary {
  border: 1px solid var(--ut-color-border);
  color: var(--ut-color-fg);
}

.tile {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: var(--ut-radius-row);
  background: var(--ut-color-fill);
}

/* Reduced motion (design §8.10): the detail does not travel; the same 150ms progress fades it in and out. */
@media (prefers-reduced-motion: reduce) and (width < 64rem) {
  .app-detail {
    translate: none;
    opacity: var(--detail-progress, 1);
  }
}

/* Desktop: the detail replaces the list in the page flow. */
@media (width >= 64rem) {
  .app-detail {
    position: static;
    inset: auto;
    overflow: visible;
    padding: 0;
    border-radius: 0;
    background: none;
    box-shadow: none;
    translate: none;
  }

  .grabber-row {
    display: none;
  }

  .top-row {
    display: flex;
    margin-bottom: 24px;
  }
}
</style>
