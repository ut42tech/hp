import { defineNuxtPlugin } from "#imports";
import { initCursor } from "ipad-cursor";

// The desktop pointer (design §8.8): ipad-cursor with its own look, for a mouse or trackpad and without
// reduced motion. Pressable elements opt in with data-cursor="block"; everyone else keeps the system pointer.
export default defineNuxtPlugin(() => {
  const fine = window.matchMedia("(pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduced) return;
  // Pills keep their shape, and new pages and sheets are picked up without calling updateCursor().
  initCursor({ blockStyle: { radius: "auto" }, enableAutoUpdateCursor: true });
});
