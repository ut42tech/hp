<script setup lang="ts">
import { computed } from "vue";
import { useT } from "~/composables/use-locale";

// Behind a sheet the greeting is scenery: hidden from assistive tech and not the page heading.
const props = defineProps<{ decorative?: boolean }>();
const t = useT();
const title = computed(() => t.value("hello.title"));
</script>

<template>
  <div
    class="hello-stage"
    :class="{ 'is-decorative': props.decorative }"
    :aria-hidden="props.decorative ? 'true' : undefined"
  >
    <component
      :is="props.decorative ? 'p' : 'h1'"
      class="text-display text-fg"
      :aria-label="props.decorative ? undefined : title"
    >
      <span v-for="(letter, i) in [...title]" :key="i" class="letter" aria-hidden="true">{{
        letter
      }}</span>
    </component>
    <p class="hello-sub mt-4 text-callout text-muted lg:mt-5">{{ t("hello.sub") }}</p>
  </div>
</template>

<style scoped>
.hello-stage {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-inline: 16px;
  text-align: center;
}

.letter {
  display: inline-block;
}

@media (width >= 64rem) {
  .hello-stage.is-decorative {
    display: none;
  }
}
</style>
