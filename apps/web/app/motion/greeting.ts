import { GREETING } from "@ut42tech/tokens/motion";
import { animate, motionValue } from "motion";

type Point = { x: number; y: number };

// How far a letter leans toward the pointer: up to maxX across and maxY up or down, falling to nothing at reachPx.
export function pull(letter: Point, pointer: Point): Point {
  const dx = pointer.x - letter.x;
  const dy = pointer.y - letter.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0 || distance >= GREETING.reachPx) return { x: 0, y: 0 };
  const strength = 1 - distance / GREETING.reachPx;
  return {
    x: (dx / distance) * GREETING.maxX * strength,
    y: (dy / distance) * GREETING.maxY * strength,
  };
}

// The upward speed (px/s, negative is up) a press gives one letter: a little different for each.
export function bounceSpeed(random: () => number): number {
  const { minSpeed, maxSpeed } = GREETING.bounce;
  return -(minSpeed + (maxSpeed - minSpeed) * random());
}

// Brings the letters to life: with a fine pointer they lean toward it and settle back after idleMs; pressing
// the word throws them up and lets them fall back on the same spring. Moves `translate` only (the entrance
// owns `transform`). Returns a cleanup.
export function attachGreeting(
  letters: HTMLElement[],
  options: { finePointer: boolean },
): () => void {
  const word = letters[0]?.parentElement;
  const offsets = letters.map((element) => {
    const x = motionValue(0);
    const y = motionValue(0);
    const render = () => (element.style.translate = `${x.get()}px ${y.get()}px`);
    return { element, x, y, stops: [x.on("change", render), y.on("change", render)] };
  });
  let idle: ReturnType<typeof setTimeout> | undefined;

  const settle = () => {
    for (const { x, y } of offsets) {
      animate(x, 0, GREETING.spring);
      animate(y, 0, GREETING.spring);
    }
  };

  const lean = (event: PointerEvent) => {
    for (const { element, x, y } of offsets) {
      const box = element.getBoundingClientRect();
      // Where the letter rests: its box minus the lean it already has.
      const rest = { x: box.left + box.width / 2 - x.get(), y: box.top + box.height / 2 - y.get() };
      const target = pull(rest, { x: event.clientX, y: event.clientY });
      animate(x, target.x, GREETING.spring);
      animate(y, target.y, GREETING.spring);
    }
    clearTimeout(idle);
    idle = setTimeout(settle, GREETING.idleMs);
  };

  const bounce = () => {
    for (const { y } of offsets)
      animate(y, 0, { ...GREETING.spring, velocity: bounceSpeed(Math.random) });
  };

  if (options.finePointer) window.addEventListener("pointermove", lean, { passive: true });
  word?.addEventListener("pointerdown", bounce);

  return () => {
    window.removeEventListener("pointermove", lean);
    word?.removeEventListener("pointerdown", bounce);
    clearTimeout(idle);
    for (const { element, x, y, stops } of offsets) {
      stops.forEach((stop) => stop());
      x.stop();
      y.stop();
      element.style.removeProperty("translate");
    }
  };
}
