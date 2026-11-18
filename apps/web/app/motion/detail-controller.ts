import type { MotionValue } from "motion";

export type DetailPhase = "open" | "closing" | "closed";

export interface DetailDeps {
  // How far the detail sheet is open: 0 = out of sight, 1 = fully open.
  progress: MotionValue<number>;
  // Moves `progress` to `to`. Without a velocity it keeps the speed it already has.
  animateTo: (to: number, velocity?: number) => Promise<unknown>;
  // The app the detail shows; null once it has gone.
  show: (slug: string | null) => void;
  // Jump instead of animating (Safari's own back swipe, or a screen without sheets).
  skipAnimation: () => boolean;
  // Leaves the detail's address for the list (back or replace, so history does not grow).
  leave: () => void;
}

// The app detail over the Works list: it rises as one sheet and, when closed, slides away before it is
// removed, so it stays on screen after the address has already changed.
export function createDetailController(deps: DetailDeps, start: { slug: string | null }) {
  let phase: DetailPhase = start.slug ? "open" : "closed";
  let shownSlug = start.slug;
  // A shared link opens straight onto the detail.
  deps.progress.jump(phase === "open" ? 1 : 0);

  function moveTo(to: number, velocity?: number): Promise<unknown> {
    if (!deps.skipAnimation()) return deps.animateTo(to, velocity);
    deps.progress.jump(to);
    return Promise.resolve();
  }

  function open(slug: string) {
    phase = "open";
    shownSlug = slug;
    deps.show(slug);
    void moveTo(1);
  }

  function close(velocity?: number) {
    phase = "closing";
    void moveTo(0, velocity).then(() => {
      if (phase !== "closing") return;
      phase = "closed";
      shownSlug = null;
      deps.show(null);
    });
  }

  // The address changed (a card, the back button, a link).
  function navigate(slug: string | null) {
    if (slug && (phase !== "open" || slug !== shownSlug)) open(slug);
    else if (!slug && phase === "open") close();
  }

  // Swipe, Escape or the hidden close button: start closing now, then let the address follow. Without the
  // animation (wide screens), only leave: the detail must still be on the page when the address changes,
  // so the thumbnail morph can capture it; the address change then removes it (navigate).
  function closeByUser(velocity?: number) {
    if (phase !== "open") return;
    if (!deps.skipAnimation()) close(velocity);
    deps.leave();
  }

  // Motion never settles an animation that a grab stops, so a closing detail may not be grabbed: it would stay
  // "closing" for good, a modal that no longer closes.
  const canGrab = () => phase === "open";

  return { navigate, closeByUser, canGrab, phase: () => phase };
}
