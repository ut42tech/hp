<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "#imports";
import { useLocale, useT } from "~/composables/use-locale";
import { LOCALE_COOKIE, publishedLocales, switchLocalePath } from "~/i18n/config";
import UiIcon from "./UiIcon.vue";

const router = useRouter();
const locale = useLocale();
const t = useT();
const other = computed(() => publishedLocales.find((l) => l !== locale.value));
const href = computed(() =>
  other.value ? switchLocalePath(router.currentRoute.value.path, other.value) : undefined,
);

// Remember the chosen language so "/" can send this visitor there next time.
function remember() {
  document.cookie = `${LOCALE_COOKIE}=${other.value}; max-age=31536000; path=/; samesite=lax`;
}
</script>

<template>
  <a
    v-if="other"
    :href="href"
    :hreflang="other"
    :lang="other"
    class="grid size-11 place-items-center text-fg"
    :aria-label="t('locale.switch')"
    data-cursor="block"
    @click="remember"
  >
    <UiIcon name="language" :size="20" />
  </a>
</template>
