import { EASE, INTRO } from "@ut42tech/tokens/motion";
import { animate, type AnimationPlaybackControls } from "motion";

type Ease = keyof typeof EASE | "linear";

export interface IntroStep {
  target: "curtain" | "name" | "band" | "letter" | "sub";
  index: number;
  at: number;
  duration: number;
  keyframes: Record<string, (string | number)[]>;
  ease: Ease;
}

// The entrance as a timetable (visual spec §9.1): the name rises and leaves, the bands lift left to right,
// then on Hello "Welcome." rises letter by letter and the sub line fades in. Reduced motion only fades the
// curtain. Times are ms from the start.
export function introSteps(options: {
  mode: "play" | "fade";
  bands: number;
  letters: number;
}): IntroStep[] {
  if (options.mode === "fade") {
    return [
      {
        target: "curtain",
        index: 0,
        at: 0,
        duration: INTRO.reducedFadeMs,
        keyframes: { opacity: [1, 0] },
        ease: "linear",
      },
    ];
  }
  const { nameIn, nameOut, bands, letters, sub } = INTRO;
  const steps: IntroStep[] = [
    {
      target: "name",
      index: 0,
      at: nameIn.at,
      duration: nameIn.duration,
      keyframes: { y: ["100%", 0] },
      ease: "ease-out",
    },
    {
      target: "name",
      index: 0,
      at: nameOut.at,
      duration: nameOut.duration,
      keyframes: { y: [0, -nameOut.liftPx] },
      ease: "ease-in-out",
    },
    {
      target: "name",
      index: 0,
      at: nameOut.at,
      duration: nameOut.opacityDuration,
      keyframes: { opacity: [1, 0] },
      ease: "ease-in-out",
    },
  ];
  for (let i = 0; i < options.bands; i++) {
    steps.push({
      target: "band",
      index: i,
      at: bands.at + bands.staggerMs * i,
      duration: bands.duration,
      keyframes: { y: [0, "-100%"] },
      ease: "ease-curtain",
    });
  }
  for (let i = 0; i < options.letters; i++) {
    steps.push({
      target: "letter",
      index: i,
      at: letters.at + letters.staggerMs * i,
      duration: letters.duration,
      keyframes: { y: [`${letters.fromEm}em`, 0], opacity: [0, 1] },
      ease: "ease-rise",
    });
  }
  if (options.letters > 0) {
    steps.push({
      target: "sub",
      index: 0,
      at: sub.at,
      duration: sub.duration,
      keyframes: { opacity: [0, 1] },
      ease: "ease-out",
    });
  }
  return steps;
}

export interface IntroElements {
  curtain: HTMLElement;
  bands: HTMLElement[];
  name: HTMLElement;
  letters: HTMLElement[];
  sub?: HTMLElement;
}

// Runs the timetable as two Motion sequences (the curtain's, then the greeting's), so steps that animate the
// same value one after another (the name's rise and exit) chain on one timeline instead of stopping each
// other. `curtainGone` settles when the curtain's sequence ends, `finished` when both have; `skip` jumps both
// to their end.
export function playIntro(
  elements: IntroElements,
  mode: "play" | "fade",
): { curtainGone: Promise<void>; finished: Promise<void>; skip: () => void } {
  const steps = introSteps({
    mode,
    bands: elements.bands.length,
    letters: elements.letters.length,
  });
  const targetOf = (step: IntroStep): HTMLElement | undefined =>
    step.target === "curtain"
      ? elements.curtain
      : step.target === "name"
        ? elements.name
        : step.target === "band"
          ? elements.bands[step.index]
          : step.target === "letter"
            ? elements.letters[step.index]
            : elements.sub;
  const sequence = (part: IntroStep[]): AnimationPlaybackControls | null => {
    const segments = part.flatMap((step) => {
      const element = targetOf(step);
      if (!element) return [];
      const options = {
        at: step.at / 1000,
        duration: step.duration / 1000,
        ease: step.ease === "linear" ? "linear" : [...EASE[step.ease]],
      };
      return [[element, step.keyframes, options]] as const;
    });
    // oxlint-disable-next-line typescript/no-unsafe-argument -- Motion's sequence tuple type is not exported
    return segments.length > 0 ? animate(segments as never) : null;
  };
  const isCurtain = (step: IntroStep) =>
    step.target === "curtain" || step.target === "name" || step.target === "band";
  const curtain = sequence(steps.filter(isCurtain));
  const greeting = sequence(steps.filter((step) => !isCurtain(step)));
  const done = (controls: AnimationPlaybackControls | null) =>
    controls ? controls.finished.then(() => undefined) : Promise.resolve();
  return {
    curtainGone: done(curtain),
    finished: Promise.all([done(curtain), done(greeting)]).then(() => undefined),
    skip: () => {
      curtain?.complete();
      greeting?.complete();
    },
  };
}

// Skipping can be asked for before the entrance starts (fonts still loading): remember it and skip as soon as
// the entrance is attached; afterwards a request skips at once. Only the first request counts.
export function createSkipSwitch(): {
  request: () => void;
  attach: (intro: { skip: () => void }) => void;
} {
  let requested = false;
  let attached: { skip: () => void } | null = null;
  return {
    request: () => {
      if (requested) return;
      requested = true;
      attached?.skip();
    },
    attach: (intro) => {
      attached = intro;
      if (requested) intro.skip();
    },
  };
}
