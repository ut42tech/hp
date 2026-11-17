<script setup lang="ts">
import { ref } from "vue";
import { useT } from "~/composables/use-locale";
import UiIcon from "./UiIcon.vue";

const props = defineProps<{ email: string }>();
const t = useT();
const status = ref("");

// Copies the address and announces it through the polite live region next to the button.
async function copy() {
  try {
    await navigator.clipboard.writeText(props.email);
  } catch {
    return;
  }
  status.value = t.value("about.copied");
  window.setTimeout(() => (status.value = ""), 2000);
}
</script>

<template>
  <button
    type="button"
    class="copy"
    :aria-label="t('about.copy')"
    data-cursor="block"
    @click="copy"
  >
    <UiIcon name="copy" :size="16" />
  </button>
  <span class="sr-only" aria-live="polite">{{ status }}</span>
</template>

<style scoped>
.copy {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-right: -14px;
  color: var(--ut-color-fg);
}
</style>
