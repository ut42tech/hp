import { motionValue } from "motion";
import { beforeEach, expect, test } from "vite-plus/test";
import { createSheetController, type SheetDeps } from "./sheet-controller";

// Routes are plain paths here; the controller never looks inside them.
let progress = motionValue(1);
let shown: string | null = null;
let animations: { to: number; velocity?: number; finish: () => void }[] = [];
let scrollResets = 0;
let options = { skip: false, stow: true };

function deps(): SheetDeps<string> {
  return {
    progress,
    animateTo: (to, velocity) =>
      new Promise<void>((resolve) => {
        animations.push({ to, velocity, finish: () => (progress.set(to), resolve()) });
      }),
    show: (route) => (shown = route),
    resetScroll: () => scrollResets++,
    skipAnimation: () => options.skip,
    stowOnSwitch: () => options.stow,
  };
}

// The app shows the first page itself; the controller only changes it afterwards.
function sheetOn(route: string, section: "about" | "works" | "press") {
  shown = route;
  return createSheetController(deps(), { route, section });
}

beforeEach(() => {
  progress = motionValue(1);
  shown = null;
  animations = [];
  scrollResets = 0;
  options = { skip: false, stow: true };
});

test("switching tabs stows, swaps once below SWAP_AT, then rises", () => {
  const sheet = sheetOn("/ja/about", "about");
  sheet.navigate("/ja/works/apps", "works");
  expect(animations.at(-1)!.to).toBe(0);
  progress.set(0.2);
  expect(shown).toBe("/ja/about");
  progress.set(0.02);
  expect(shown).toBe("/ja/works/apps");
  expect(scrollResets).toBe(1);
  expect(animations.at(-1)!.to).toBe(1);
  progress.set(0.01);
  expect(scrollResets).toBe(1);
});

test("tapping two tabs while stowed swaps only to the last one", () => {
  const sheet = sheetOn("/ja/about", "about");
  sheet.navigate("/ja/works/apps", "works");
  sheet.navigate("/ja/press", "press");
  progress.set(0.02);
  expect(shown).toBe("/ja/press");
  expect(scrollResets).toBe(1);
});

test("a tab tapped while closing reopens with the speed it has", () => {
  const sheet = sheetOn("/ja/about", "about");
  sheet.navigate("/ja/", "hello");
  expect(animations.at(-1)!.to).toBe(0);
  sheet.navigate("/ja/press", "press");
  expect(shown).toBe("/ja/press");
  expect(animations.at(-1)).toMatchObject({ to: 1, velocity: undefined });
  animations[0]!.finish(); // the interrupted close settling late must not hide the sheet
  expect(shown).toBe("/ja/press");
});

test("closing keeps the page on the sheet until it is out of sight", async () => {
  const sheet = sheetOn("/ja/about", "about");
  sheet.navigate("/ja/", "hello");
  expect(shown).toBe("/ja/about");
  animations.at(-1)!.finish();
  await Promise.resolve();
  expect(shown).toBeNull();
});

test("moving inside Works does not move the sheet", () => {
  const sheet = sheetOn("/ja/works/apps", "works");
  sheet.navigate("/ja/works/apps/coto2-ba", "works");
  expect(shown).toBe("/ja/works/apps/coto2-ba");
  expect(animations).toEqual([]);
});

test("without stowing (wide screens, reduced motion) a tab switch swaps in place", () => {
  options.stow = false;
  const sheet = sheetOn("/ja/about", "about");
  sheet.navigate("/ja/press", "press");
  expect(shown).toBe("/ja/press");
  expect(animations).toEqual([]);
});

test("Safari's own back swipe jumps instead of animating", async () => {
  options.skip = true;
  const sheet = sheetOn("/ja/about", "about");
  sheet.navigate("/ja/", "hello");
  await Promise.resolve();
  expect(progress.get()).toBe(0);
  expect(shown).toBeNull();
  expect(animations).toEqual([]);
});

test("a drag release closes with the finger's speed", () => {
  const sheet = sheetOn("/ja/about", "about");
  sheet.close(-2.5);
  expect(animations.at(-1)).toMatchObject({ to: 0, velocity: -2.5 });
  sheet.navigate("/ja/", "hello"); // the address follows; no second close
  expect(animations).toHaveLength(1);
});

// Motion never settles an animation that a grab stops, so a sheet that is mid-switch or mid-close must not
// be grabbed: its phase would never move on, leaving a dead tab bar or a sheet over Hello.
test("only a sheet that is open can be grabbed", () => {
  const sheet = sheetOn("/ja/about", "about");
  expect(sheet.canGrab()).toBe(true);
  sheet.navigate("/ja/works/apps", "works");
  expect(sheet.canGrab()).toBe(false);
  progress.set(0.02);
  expect(sheet.canGrab()).toBe(true);
  sheet.navigate("/ja/", "hello");
  expect(sheet.canGrab()).toBe(false);
});
