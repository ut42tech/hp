import { POINTER } from "@ut42tech/tokens/motion";
import { disposeCursor, initCursor, type IpadCursorConfig } from "ipad-cursor";

// ipad-cursor's settings, from the tokens. The colours are theme tokens, so the pointer follows light and dark.
export const pointerConfig: IpadCursorConfig = {
  blockPadding: POINTER.blockPaddingPx,
  adsorptionStrength: POINTER.adsorption,
  // A dot everywhere but on pressable elements ([data-cursor="block"]).
  enableAutoTextCursor: false,
  // Pages, sheets and the sort order change the DOM; ipad-cursor picks up the new elements by itself.
  enableAutoUpdateCursor: true,
  enableLighting: true,
  enableMouseDownEffect: true,
  normalStyle: {
    width: POINTER.sizePx,
    height: POINTER.sizePx,
    radius: "50%",
    durationBase: POINTER.moveMs,
    background: "var(--ut-color-pointer)",
    border: "0px solid transparent",
    zIndex: 100,
  },
  blockStyle: {
    // The element's own corners grown by the padding; pills stay pills.
    radius: "auto",
    durationBase: POINTER.moveMs,
    background: "var(--ut-color-pointer-block)",
    border: "0px solid transparent",
  },
  mouseDownStyle: { scale: POINTER.pressScale, background: "var(--ut-color-pointer-block)" },
};

// Starts ipad-cursor on the first mouse move (until then it would sit in the top-left corner and hide the
// system pointer for nothing). A pen, a touch on a laptop screen, or the pointer leaving the window sets
// html.pointer-off: the dot steps aside and the system pointer is back (global.css). Returns a cleanup.
export function startPointer(doc: Document): () => void {
  const root = doc.documentElement;
  let started = false;
  root.classList.add("pointer-off");

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") {
      root.classList.add("pointer-off");
      return;
    }
    if (!started) {
      started = true;
      initCursor(pointerConfig);
      root.classList.add("has-pointer");
      // ipad-cursor learns the position from its own next move; show the dot from then on.
      return;
    }
    root.classList.remove("pointer-off");
  };
  const onLeave = () => root.classList.add("pointer-off");

  doc.addEventListener("pointermove", onMove, { passive: true });
  doc.addEventListener("pointerdown", onMove, { passive: true });
  root.addEventListener("pointerleave", onLeave);

  return () => {
    doc.removeEventListener("pointermove", onMove);
    doc.removeEventListener("pointerdown", onMove);
    root.removeEventListener("pointerleave", onLeave);
    if (started) disposeCursor();
    root.classList.remove("has-pointer", "pointer-off");
  };
}
