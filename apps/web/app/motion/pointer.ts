import { EASE, POINTER } from "@ut42tech/tokens/motion";
import { animate } from "motion";

type Box = Pick<DOMRect, "left" | "top" | "width" | "height">;
export interface Frame {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: string;
}

// The pointer's shape over a pressable element: the element grown by blockPaddingPx on every side, its corners
// grown by the same amount (a pill stays a pill). Uneven corners follow the first one.
export function blockFrame(box: Box, radius: string): Frame {
  const pad = POINTER.blockPaddingPx;
  const width = box.width + pad * 2;
  const height = box.height + pad * 2;
  const first = Number.parseFloat(radius) || 0;
  const pill = first * 2 >= Math.min(box.width, box.height);
  return {
    x: box.left - pad,
    y: box.top - pad,
    width,
    height,
    radius: pill ? radius.split(" ")[0]! : `${first + pad}px`,
  };
}

const dot = (x: number, y: number): Frame => ({
  x: x - POINTER.sizePx / 2,
  y: y - POINTER.sizePx / 2,
  width: POINTER.sizePx,
  height: POINTER.sizePx,
  radius: "50%",
});

// A pointer that settles onto pressable elements ([data-cursor="block"]) like on a tablet, and is a small dot
// everywhere else. Follows changing pages by itself: the element under the pointer is looked up and measured
// again on every move. Returns a cleanup that restores the system pointer.
export function startPointer(doc: Document): () => void {
  const root = doc.documentElement;
  const layer = doc.createElement("div");
  layer.className = "pointer";
  layer.setAttribute("aria-hidden", "true");
  doc.body.append(layer);
  root.classList.add("has-pointer");

  let block: HTMLElement | null = null;
  let current: Frame | null = null;
  const move = {
    duration: POINTER.moveMs / 1000,
    ease: [...EASE["ease-out"]] as [number, number, number, number],
  };

  const place = (frame: Frame, animated: boolean) => {
    const same =
      current &&
      current.x === frame.x &&
      current.y === frame.y &&
      current.width === frame.width &&
      current.height === frame.height &&
      current.radius === frame.radius;
    current = frame;
    if (same) return;
    const values = {
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height,
      borderRadius: frame.radius,
    };
    // Always through Motion, so the position lives in one place (its x/y transform).
    animate(layer, values, animated ? move : { duration: 0 });
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    layer.classList.add("is-visible");
    const target =
      (event.target as Element | null)?.closest<HTMLElement>('[data-cursor="block"]') ?? null;
    if (target) {
      const box = target.getBoundingClientRect();
      const frame = blockFrame(box, getComputedStyle(target).borderTopLeftRadius);
      // The light follows the pointer across the element.
      layer.style.setProperty("--pointer-light-x", `${event.clientX - frame.x}px`);
      layer.style.setProperty("--pointer-light-y", `${event.clientY - frame.y}px`);
      layer.classList.add("is-block");
      place(frame, true);
    } else {
      layer.classList.remove("is-block");
      // Leaving an element animates back to the dot; after that the dot follows the pointer directly.
      place(dot(event.clientX, event.clientY), block !== null);
    }
    block = target;
  };
  const onDown = () => animate(layer, { scale: POINTER.pressScale }, move);
  const onUp = () => animate(layer, { scale: 1 }, move);
  const onLeave = () => layer.classList.remove("is-visible");

  doc.addEventListener("pointermove", onMove, { passive: true });
  doc.addEventListener("pointerdown", onDown, { passive: true });
  doc.addEventListener("pointerup", onUp, { passive: true });
  root.addEventListener("pointerleave", onLeave);

  return () => {
    doc.removeEventListener("pointermove", onMove);
    doc.removeEventListener("pointerdown", onDown);
    doc.removeEventListener("pointerup", onUp);
    root.removeEventListener("pointerleave", onLeave);
    layer.remove();
    root.classList.remove("has-pointer");
  };
}
