import { defineNuxtPlugin, useRouter } from "#imports";
import { uaTransition } from "~/motion/history";

// Safari's edge swipe already shows its own back animation; ours would play it a second time.
export default defineNuxtPlugin(() => {
  window.addEventListener(
    "popstate",
    (event: PopStateEvent & { hasUAVisualTransition?: boolean }) => {
      uaTransition.skip = Boolean(event.hasUAVisualTransition);
    },
  );
  useRouter().afterEach(() => {
    requestAnimationFrame(() => (uaTransition.skip = false));
  });
});
