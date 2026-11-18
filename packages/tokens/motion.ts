// Motion values from docs/superpowers/specs/2026-11-18-portfolio-motion-design.md §8 (tuned in the prototype).

// Stiffness from the visual spec §9.4. Damping 39 is critical (2·√380): no overshoot, so a sheet does not
// wobble as it lands. Progress runs 0–1, so the rest thresholds are scaled to it: Motion's defaults
// (0.01 and 0.1/s) stop about 8px short on a phone and snap the rest.
export const SHEET_SPRING = {
  type: "spring",
  stiffness: 380,
  damping: 39,
  restDelta: 0.0005,
  restSpeed: 0.005,
} as const;

// Inertia per millisecond, used to predict where a flick would come to rest.
export const DECAY_PER_MS = 0.998;
// A sheet closes when the drag plus the predicted travel passes this share of its height.
export const CLOSE_FRACTION = 1 / 3;
// Above fully open, a sheet moves this much per pixel pulled.
export const RUBBER_BAND = 0.15;
// While switching tabs, the page is swapped once the sheet is this close to stowed.
export const SWAP_AT = 0.03;
// "Reduce motion": springs become a short fade.
export const REDUCED_DURATION_MS = 150;

// The Works sheet behind an app detail: narrower on each side and its top edge lifted.
export const RECEDE = { insetPx: 12, liftPx: 10 } as const;

// Swapping content in place (desktop, Works categories): old content out, new content in from below.
export const SWAP_OUT_MS = 120;
export const SWAP_IN_MS = 200;
export const SWAP_IN_OFFSET_PX = 8;
