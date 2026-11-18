import { shallowRef, watch, type ComputedRef, type ShallowRef } from "vue";
import { useRouter } from "#imports";
import { createDetailController } from "~/motion/detail-controller";
import { shouldClose } from "~/motion/gesture";
import { closeAction, uaTransition } from "~/motion/history";
import { dragProgress, springTo } from "~/motion/progress";
import { useNarrow } from "./use-narrow";
import { useReducedMotion } from "./use-reduced-motion";
import { detailProgress } from "./use-sheet";

// `slug` follows the address; `shownSlug` is what is on screen (it lags while the detail slides away).
export function useDetail(
  slug: ComputedRef<string | undefined>,
  listPath: ComputedRef<string>,
): {
  shownSlug: ShallowRef<string | null>;
  startDrag: (event: PointerEvent, sheet: HTMLElement) => void;
  close: () => void;
} {
  const router = useRouter();
  const narrow = useNarrow();
  const reduced = useReducedMotion();
  const shownSlug = shallowRef<string | null>(slug.value ?? null);

  const detail = createDetailController(
    {
      progress: detailProgress,
      animateTo: (to, velocity) =>
        springTo(detailProgress, to, { velocity, reduced: reduced.value }).finished,
      show: (value) => (shownSlug.value = value),
      // Wide screens show the detail in the page, with nothing to slide.
      skipAnimation: () => uaTransition.skip || !narrow.value,
      leave: () => {
        if (closeAction(history.state?.back, listPath.value) === "back") router.back();
        else void router.replace(listPath.value);
      },
    },
    { slug: shownSlug.value },
  );

  watch(slug, (value) => detail.navigate(value ?? null));

  function startDrag(event: PointerEvent, sheet: HTMLElement) {
    if (!narrow.value) return;
    const height = () => sheet.offsetHeight;
    dragProgress(event, detailProgress, height, ({ offsetPx, velocityPx }) => {
      const velocity = -velocityPx / height();
      if (shouldClose(offsetPx, velocityPx, height())) detail.closeByUser(velocity);
      else springTo(detailProgress, 1, { velocity, reduced: reduced.value });
    });
  }

  return { shownSlug, startDrag, close: () => detail.closeByUser() };
}
