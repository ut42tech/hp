import { REDUCED_DURATION_MS, SHEET_SPRING } from "@ut42tech/tokens/motion";
import { animate, type AnimationPlaybackControls, type MotionValue } from "motion";
import { followFinger } from "./gesture";

interface SpringOptions {
  // Starting speed in progress units per second. Left out, the value keeps the speed it already has,
  // so a new target mid-flight turns the motion around instead of restarting it.
  velocity?: number;
  reduced?: boolean;
}

export function springTo(
  value: MotionValue<number>,
  to: number,
  { velocity, reduced = false }: SpringOptions = {},
): AnimationPlaybackControls {
  if (reduced) return animate(value, to, { duration: REDUCED_DURATION_MS / 1000, ease: "easeOut" });
  return animate(value, to, velocity === undefined ? SHEET_SPRING : { ...SHEET_SPRING, velocity });
}

interface Release {
  // How far below fully open the sheet was let go, and how fast it was moving down (px/s).
  offsetPx: number;
  velocityPx: number;
}

// Lets a finger drag a progress value (1 = open, 0 = closed). Motion tracks the value's velocity,
// so the release speed is read straight from it.
export function dragProgress(
  event: PointerEvent,
  value: MotionValue<number>,
  heightPx: () => number,
  onRelease: (release: Release) => void,
): void {
  if (event.button !== 0) return;
  const target = event.currentTarget as HTMLElement;
  try {
    target.setPointerCapture(event.pointerId);
  } catch {
    // Synthetic events have no active pointer to capture; the drag still works while over the target.
  }
  value.stop();
  const startY = event.clientY;
  const start = value.get();
  const move = (e: PointerEvent) => value.set(followFinger(start, e.clientY - startY, heightPx()));
  const up = () => {
    target.removeEventListener("pointermove", move);
    target.removeEventListener("pointerup", up);
    target.removeEventListener("pointercancel", up);
    onRelease({
      offsetPx: (1 - value.get()) * heightPx(),
      velocityPx: -value.getVelocity() * heightPx(),
    });
  };
  target.addEventListener("pointermove", move);
  target.addEventListener("pointerup", up);
  target.addEventListener("pointercancel", up);
}
