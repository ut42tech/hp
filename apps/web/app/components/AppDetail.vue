<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ContentRenderer, NuxtLink } from "#components";
import { useLocale, useT } from "~/composables/use-locale";
import { useNarrow } from "~/composables/use-narrow";
import type { WorkEntry } from "~/composables/use-works";
import { localizePath } from "~/i18n/config";
import { brandIcons } from "~/lib/icons";
import type { Localized } from "~/lib/localized";
import { formatMonth, initialOf } from "~/lib/works";
import { applySheetMode } from "~/motion/dialog-mode";
import BrandIcon from "./BrandIcon.vue";
import Thumb from "./Thumb.vue";
import UiIcon from "./UiIcon.vue";

const props = defineProps<{ entry: Localized<WorkEntry<"apps">> }>();
const emit = defineEmits<{ close: [] }>();
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

// The mode follows the width, so rotating a tablet or resizing a window across 1024px stays correct.
onMounted(() => {
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
    <div class="grabber-row" aria-hidden="true">
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
      <NuxtLink :to="listHref()" class="back text-callout font-bold" data-cursor="block">
        <UiIcon name="chevron-left" :size="14" />
        {{ t("detail.back") }}
      </NuxtLink>
    </div>

    <Thumb
      :src="entry.thumbnail"
      alt=""
      :initial="initialOf(entry.title, entry.initial)"
      sizes="100vw lg:720px"
      class="aspect-[16/10] rounded-card"
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
/* Mobile: a second sheet stacked over the Works sheet and above the nav bar. */
.app-detail {
  position: fixed;
  inset: var(--sheet-top) 0 0;
  z-index: 40;
  width: 100%;
  max-width: none;
  height: auto;
  max-height: none;
  margin: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 max(var(--gutter-right), calc((100% - var(--ut-width-reading)) / 2))
    calc(var(--bottom-inset) + 24px)
    max(var(--gutter-left), calc((100% - var(--ut-width-reading)) / 2));
  border: 0;
  border-radius: var(--ut-radius-sheet) var(--ut-radius-sheet) 0 0;
  background: var(--ut-color-surface);
  color: inherit;
  box-shadow: var(--ut-shadow-sheet);
  view-transition-name: app-detail;
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
