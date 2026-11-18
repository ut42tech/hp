import { watch, type Ref } from "vue";
import { slideMark } from "~/motion/slide-mark";
import { useReducedMotion } from "./use-reduced-motion";

// When the selection changes, remember where the old mark was (before the DOM updates), then slide the new
// one in from there (after). With reduced motion the mark just switches.
export function useSlidingMark(
  container: Ref<HTMLElement | undefined>,
  selected: () => unknown,
): void {
  const reduced = useReducedMotion();
  let from: DOMRect | null = null;
  watch(
    selected,
    () => {
      from = container.value?.querySelector("[data-indicator]")?.getBoundingClientRect() ?? null;
    },
    { flush: "pre" },
  );
  watch(
    selected,
    () => {
      if (container.value && !reduced.value) slideMark(container.value, from);
    },
    { flush: "post" },
  );
}
