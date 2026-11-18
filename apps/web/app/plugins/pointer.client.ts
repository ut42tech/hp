import { defineNuxtPlugin } from "#imports";

// The desktop pointer (design §8.8) only for a mouse or trackpad and without reduced motion. Loaded on demand,
// so touch devices never download it; everyone else keeps the system pointer.
export default defineNuxtPlugin(() => {
  const fine = window.matchMedia("(pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduced) return;
  void import("~/motion/pointer").then(({ startPointer }) => startPointer(document));
});
