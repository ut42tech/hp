import { SWAP_AT } from "@ut42tech/tokens/motion";
import type { MotionValue } from "motion";
import type { Section } from "../lib/section";

export type SheetPhase = "open" | "switching" | "closing" | "closed";

export interface SheetDeps<Route> {
  // How far the sheet is open: 0 = out of sight, 1 = fully open.
  progress: MotionValue<number>;
  // Moves `progress` to `to`. Without a velocity it keeps the speed it already has.
  animateTo: (to: number, velocity?: number) => Promise<unknown>;
  // The page the sheet shows; null once it has gone.
  show: (route: Route | null) => void;
  resetScroll: () => void;
  // Jump instead of animating (Safari's own back swipe, or a screen without the sheet).
  skipAnimation: () => boolean;
  // Stow and rise on a tab switch; otherwise swap in place (wide screens, reduced motion).
  stowOnSwitch: () => boolean;
}

const tabs: readonly Section[] = ["about", "works", "press"];

// The mobile sheet across navigations: opens from Hello, closes to it, and on a tab switch stows away,
// swaps its page while out of sight and rises again. Every move starts from the speed the sheet already
// has, so a tap mid-motion turns it around instead of restarting it.
export function createSheetController<Route>(
  deps: SheetDeps<Route>,
  start: { route: Route | null; section: Section },
) {
  let phase: SheetPhase = start.route ? "open" : "closed";
  let shownSection = start.section;
  let pending: { route: Route; section: Section } | null = null;
  let stopWatchingStow: (() => void) | undefined;
  deps.progress.jump(phase === "open" ? 1 : 0);

  function moveTo(to: number, velocity?: number): Promise<unknown> {
    if (!deps.skipAnimation()) return deps.animateTo(to, velocity);
    deps.progress.jump(to);
    return Promise.resolve();
  }

  function show(route: Route, section: Section) {
    deps.show(route);
    shownSection = section;
  }

  function open(route: Route, section: Section) {
    show(route, section);
    phase = "open";
    void moveTo(1);
  }

  function swap() {
    stopWatchingStow?.();
    stopWatchingStow = undefined;
    if (!pending) return;
    show(pending.route, pending.section);
    pending = null;
    deps.resetScroll();
    phase = "open";
  }

  function switchTo(route: Route, section: Section) {
    pending = { route, section };
    if (phase === "switching") return;
    if (!deps.stowOnSwitch() || deps.skipAnimation()) {
      swap();
      return;
    }
    phase = "switching";
    void moveTo(0);
    stopWatchingStow = deps.progress.on("change", (value) => {
      if (value > SWAP_AT) return;
      swap();
      void moveTo(1);
    });
  }

  function close(velocity?: number) {
    stopWatchingStow?.();
    stopWatchingStow = undefined;
    pending = null;
    phase = "closing";
    void moveTo(0, velocity).then(() => {
      if (phase !== "closing") return;
      phase = "closed";
      deps.show(null);
    });
  }

  function navigate(route: Route, section: Section) {
    if (!tabs.includes(section)) {
      if (phase === "open" || phase === "switching") close();
    } else if (phase === "closed" || phase === "closing") {
      open(route, section);
    } else if (phase === "switching" || section !== shownSection) {
      switchTo(route, section);
    } else {
      // Same tab (an app detail inside Works, another category): the sheet stays put.
      show(route, section);
    }
  }

  // Motion never settles an animation that a grab stops, so only an open sheet may be grabbed: mid-switch or
  // mid-close the phase would never move on (a dead tab bar, or a sheet left over Hello).
  const canGrab = () => phase === "open";

  return { navigate, close, canGrab, phase: () => phase };
}
