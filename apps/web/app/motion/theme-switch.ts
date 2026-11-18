import { EASE, THEME_SWITCH } from "@ut42tech/tokens/motion";

interface Point {
  x: number;
  y: number;
}

// The mask on the new theme's snapshot: a soft circle that grows from `origin` until its solid part covers the
// farthest corner of the viewport.
export function revealKeyframes(origin: Point, viewport: { width: number; height: number }) {
  const { x, y } = origin;
  const corner = Math.hypot(Math.max(x, viewport.width - x), Math.max(y, viewport.height - y));
  const size = (2 * corner) / (1 - THEME_SWITCH.feather);
  const circle = `radial-gradient(closest-side, black ${(1 - THEME_SWITCH.feather) * 100}%, transparent)`;
  return {
    maskImage: [circle, circle],
    maskRepeat: ["no-repeat", "no-repeat"],
    maskSize: ["0px 0px", `${size}px ${size}px`],
    maskPosition: [`${x}px ${y}px`, `${x - size / 2}px ${y - size / 2}px`],
  };
}

// Runs `apply` (which changes the theme) inside a view transition and reveals the result from `origin`.
// Without View Transitions, or with reduced motion, the theme just changes.
export function switchTheme(doc: Document, apply: () => void, origin: Point): void {
  const view = doc.defaultView;
  const reduced = view?.matchMedia("(prefers-reduced-motion: reduce)").matches ?? true;
  if (!doc.startViewTransition || reduced || !view) {
    apply();
    return;
  }
  const root = doc.documentElement;
  // global.css: one snapshot of the whole page (no separately named parts) and no cross-fade.
  root.classList.add("theme-switching");
  const transition = doc.startViewTransition(apply);
  void transition.ready.then(
    () => {
      root.animate(revealKeyframes(origin, { width: view.innerWidth, height: view.innerHeight }), {
        duration: THEME_SWITCH.durationMs,
        easing: `cubic-bezier(${EASE[THEME_SWITCH.ease].join(", ")})`,
        fill: "both",
        pseudoElement: "::view-transition-new(root)",
      });
    },
    () => {
      // Skipped (another transition took over): the theme has still changed.
    },
  );
  void transition.finished.finally(() => root.classList.remove("theme-switching"));
}
