<script setup lang="ts">
import { INTRO } from "@ut42tech/tokens/motion";
import { profile } from "@ut42tech/profile";

// The entrance's curtain: vertical bands over everything, with the name rising through a window the height of
// its letters (visual spec §9.1). Hidden unless an intro plays (html[data-intro], global.css); app/plugins/intro
// moves it, then removes html[data-intro].
const bands = Array.from({ length: INTRO.bands.count }, (_, i) => i);
</script>

<template>
  <!-- popover="manual": the plugin raises it into the top layer, above a detail opened as a modal. -->
  <div class="intro-curtain" popover="manual" aria-hidden="true">
    <span v-for="band in bands" :key="band" class="intro-band bg-curtain" data-intro-band />
    <span class="intro-name-window">
      <span class="intro-name-clip" data-intro-name-window>
        <span class="intro-name text-loader text-on-curtain" data-intro-name>{{
          profile.name
        }}</span>
      </span>
    </span>
  </div>
</template>

<style scoped>
.intro-curtain {
  grid-template-columns: repeat(5, 1fr);
}

.intro-band {
  grid-row: 1;
}

.intro-name-window {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}

/* The window: the name rises into view through it. */
.intro-name-clip {
  display: block;
  overflow: hidden;
}

.intro-name {
  display: block;
}
</style>
