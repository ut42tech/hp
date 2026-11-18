import { motionValue } from "motion";
import { beforeEach, expect, test } from "vite-plus/test";
import { createDetailController, type DetailDeps } from "./detail-controller";

let progress = motionValue(0);
let shown: string | null = null;
let animations: { to: number; velocity?: number; finish: () => void }[] = [];
let leaves = 0;
let skip = false;

function deps(): DetailDeps {
  return {
    progress,
    animateTo: (to, velocity) =>
      new Promise<void>((resolve) => {
        animations.push({ to, velocity, finish: () => (progress.set(to), resolve()) });
      }),
    show: (slug) => (shown = slug),
    skipAnimation: () => skip,
    leave: () => leaves++,
  };
}

const settle = async () => {
  animations.at(-1)!.finish();
  await Promise.resolve();
};

beforeEach(() => {
  progress = motionValue(0);
  shown = null;
  animations = [];
  leaves = 0;
  skip = false;
});

test("a shared link starts fully open without animating", () => {
  shown = "coto2-ba";
  createDetailController(deps(), { slug: "coto2-ba" });
  expect(progress.get()).toBe(1);
  expect(animations).toEqual([]);
});

test("tapping a card shows the detail and springs it open", () => {
  const detail = createDetailController(deps(), { slug: null });
  detail.navigate("tangi");
  expect(shown).toBe("tangi");
  expect(animations.at(-1)!.to).toBe(1);
});

test("the browser back button plays the same close, then removes the detail", async () => {
  shown = "tangi";
  const detail = createDetailController(deps(), { slug: "tangi" });
  detail.navigate(null);
  expect(animations.at(-1)!.to).toBe(0);
  expect(shown).toBe("tangi");
  await settle();
  expect(shown).toBeNull();
  expect(leaves).toBe(0);
});

test("closing by swipe animates with the finger's speed and leaves once", () => {
  shown = "tangi";
  const detail = createDetailController(deps(), { slug: "tangi" });
  detail.closeByUser(-3);
  expect(animations.at(-1)).toMatchObject({ to: 0, velocity: -3 });
  expect(leaves).toBe(1);
  detail.navigate(null); // the address follows; no second close
  expect(animations).toHaveLength(1);
});

test("Escape and the hidden button close through the same path", () => {
  shown = "tangi";
  const detail = createDetailController(deps(), { slug: "tangi" });
  detail.closeByUser();
  expect(animations.at(-1)).toMatchObject({ to: 0, velocity: undefined });
  expect(leaves).toBe(1);
});

test("a card tapped while the detail is closing reopens it", async () => {
  shown = "tangi";
  const detail = createDetailController(deps(), { slug: "tangi" });
  detail.navigate(null);
  detail.navigate("llmeta");
  expect(shown).toBe("llmeta");
  animations[0]!.finish(); // the interrupted close settling late must not remove the new detail
  await Promise.resolve();
  expect(shown).toBe("llmeta");
});

test("Safari's own back swipe removes the detail at once", async () => {
  skip = true;
  shown = "tangi";
  const detail = createDetailController(deps(), { slug: "tangi" });
  detail.navigate(null);
  await Promise.resolve();
  expect(progress.get()).toBe(0);
  expect(shown).toBeNull();
  expect(animations).toEqual([]);
});

test("only a detail that is open can be grabbed", () => {
  shown = "tangi";
  const detail = createDetailController(deps(), { slug: "tangi" });
  expect(detail.canGrab()).toBe(true);
  detail.closeByUser();
  expect(detail.canGrab()).toBe(false);
});

// Wide screens: the detail must still be on the page when the address changes, because the thumbnail
// morph captures it as the "before" picture. So closing only leaves; the address change removes it.
test("with animation skipped (wide screens), closing leaves first and keeps the detail until the address changes", async () => {
  skip = true;
  shown = "tangi";
  const detail = createDetailController(deps(), { slug: "tangi" });
  detail.closeByUser();
  await Promise.resolve();
  expect(leaves).toBe(1);
  expect(shown).toBe("tangi");
  detail.navigate(null);
  await Promise.resolve();
  expect(shown).toBeNull();
});
