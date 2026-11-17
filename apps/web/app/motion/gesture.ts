import { CLOSE_FRACTION, DECAY_PER_MS, RUBBER_BAND } from "@ut42tech/tokens/motion";

// How far a flick at this speed (px/s) would travel on inertia before it stops.
export function projectPx(velocityPx: number): number {
  return ((velocityPx / 1000) * DECAY_PER_MS) / (1 - DECAY_PER_MS);
}

// Judges intent, not just distance: a short fast flick closes, a slow short drag springs back.
export function shouldClose(offsetPx: number, velocityPx: number, heightPx: number): boolean {
  return offsetPx + projectPx(velocityPx) > heightPx * CLOSE_FRACTION;
}

// Progress (1 = open) while a finger drags the sheet down by dyPx from `start`. Past fully open it resists.
export function followFinger(start: number, dyPx: number, heightPx: number): number {
  const next = start - dyPx / heightPx;
  return next > 1 ? 1 + (next - 1) * RUBBER_BAND : next;
}
