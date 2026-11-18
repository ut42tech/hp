import { nextTick } from "vue";
import { defineNuxtPlugin, useRouter } from "#imports";
import { morphSlug } from "~/composables/use-morph";
import { uaTransition } from "~/motion/history";
import { detailMorph } from "~/motion/morph";

// Desktop app detail (design §8.6): the card's thumbnail turns into the detail's image and back, and the rest
// cross-fades. Hooked into the router, so links, the back capsule and the browser's back button all morph.
// Phones keep their sheets; without View Transitions, or with reduced motion, the page just swaps.
export default defineNuxtPlugin(() => {
  const router = useRouter();
  const wide = window.matchMedia("(width >= 64rem)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  router.beforeResolve(async (to, from) => {
    const slug = detailMorph(from.path, to.path);
    if (
      !slug ||
      !wide.matches ||
      reduced.matches ||
      uaTransition.skip ||
      !document.startViewTransition
    ) {
      return;
    }
    // The card must carry the name before the old state is captured.
    morphSlug.value = slug;
    await nextTick();
    await new Promise<void>((resolve) => {
      const transition = document.startViewTransition(async () => {
        const settled = new Promise<void>((done) => {
          const stop = router.afterEach(() => {
            stop();
            done();
          });
        });
        resolve();
        await settled;
        await nextTick();
      });
      void transition.finished.finally(() => {
        if (morphSlug.value === slug) morphSlug.value = null;
      });
    });
  });
});
