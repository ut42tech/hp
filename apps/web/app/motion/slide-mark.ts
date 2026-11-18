import { SELECTION_SPRING } from "@ut42tech/tokens/motion";
import { animate } from "motion";

type Point = Pick<DOMRect, "left" | "top">;

// Keyframes that take the new mark from the old one's place back home, or null when it has not moved.
export function markKeyframes(from: Point, to: Point): [string, string] | null {
  const x = Math.round(from.left - to.left);
  const y = Math.round(from.top - to.top);
  if (x === 0 && y === 0) return null;
  return [`translate(${x}px, ${y}px)`, "translate(0px, 0px)"];
}

// The selected item's mark (the one [data-indicator] in `container`) slides in from `from`, where the
// previous mark was. A transform animation runs on the compositor, so it keeps moving while the next page
// renders (a JS-driven layout animation stalled there and jumped).
export function slideMark(container: ParentNode, from: Point | null): void {
  const mark = container.querySelector<HTMLElement>("[data-indicator]");
  if (!from || !mark) return;
  const keyframes = markKeyframes(from, mark.getBoundingClientRect());
  if (keyframes) animate(mark, { transform: keyframes }, SELECTION_SPRING);
}
