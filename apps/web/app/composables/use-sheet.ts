import { motionValue } from "motion";
import { shallowRef, watch, type ShallowRef } from "vue";
import { useRouter } from "#imports";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import { localizePath } from "~/i18n/config";
import { sectionOf, type Section } from "~/lib/section";
import { shouldClose } from "~/motion/gesture";
import { closeAction, uaTransition } from "~/motion/history";
import { dragProgress, springTo } from "~/motion/progress";
import { createSheetController } from "~/motion/sheet-controller";
import { useLocale } from "./use-locale";
import { useNarrow } from "./use-narrow";
import { useReducedMotion } from "./use-reduced-motion";

// How open the mobile sheet and the app detail are (0 = out of sight, 1 = open). One of each per page.
export const sheetProgress = motionValue(1);
export const detailProgress = motionValue(0);

type Route = RouteLocationNormalizedLoaded;

export function sectionOfRoute(route: Route): Section {
  return (route.meta.section as Section | undefined) ?? sectionOf(route.path);
}

// `frame` is the sheet element (it is also the sheet's scroll container).
export function useSheet(frame: () => HTMLElement | undefined): {
  shownRoute: ShallowRef<Route | null>;
  startDrag: (event: PointerEvent) => void;
} {
  const router = useRouter();
  const locale = useLocale();
  const narrow = useNarrow();
  const reduced = useReducedMotion();
  const current = router.currentRoute.value;
  const startSection = sectionOfRoute(current);
  const hasSheet = ["about", "works", "press"].includes(startSection);
  // The sheet pins its own page, so it can keep showing it while it slides away or stows.
  const shownRoute = shallowRef<Route | null>(hasSheet ? current : null);

  const sheet = createSheetController<Route>(
    {
      progress: sheetProgress,
      animateTo: (to, velocity) =>
        springTo(sheetProgress, to, { velocity, reduced: reduced.value }).finished,
      show: (route) => (shownRoute.value = route),
      resetScroll: () => frame()?.scrollTo(0, 0),
      // Wide screens have no sheet to move.
      skipAnimation: () => uaTransition.skip || !narrow.value,
      stowOnSwitch: () => narrow.value && !reduced.value,
    },
    { route: shownRoute.value, section: startSection },
  );

  watch(
    () => router.currentRoute.value,
    (route) => sheet.navigate(route, sectionOfRoute(route)),
  );

  function startDrag(event: PointerEvent) {
    const element = frame();
    if (!narrow.value || !element) return;
    const height = () => element.offsetHeight;
    dragProgress(event, sheetProgress, height, ({ offsetPx, velocityPx }) => {
      const velocity = -velocityPx / height();
      if (!shouldClose(offsetPx, velocityPx, height())) {
        springTo(sheetProgress, 1, { velocity, reduced: reduced.value });
        return;
      }
      sheet.close(velocity);
      const hello = localizePath("/", locale.value);
      if (closeAction(history.state?.back, hello) === "back") router.back();
      else void router.replace(hello);
    });
  }

  return { shownRoute, startDrag };
}
