import { INTRO } from "@ut42tech/tokens/motion";
import { defineNuxtPlugin } from "#imports";
import { createSkipSwitch, playIntro } from "~/motion/intro";

// Plays the entrance when the inline gate in <head> chose one (html[data-intro], components/SiteShell.vue).
export default defineNuxtPlugin((nuxtApp) => {
  const root = document.documentElement;
  const mode = root.dataset.intro;
  if (mode !== "play" && mode !== "fade") return;

  // Skippable at any time, even before it starts: a key, the wheel or a press. The press is not stopped (and
  // the curtain lets it through), so whatever was pressed still works.
  const switcher = createSkipSwitch();
  const inputs = ["keydown", "wheel", "pointerdown"] as const;
  const skip = () => switcher.request();
  for (const type of inputs)
    window.addEventListener(type, skip, { once: true, capture: true, passive: true });

  // The top layer stacks in the order things enter it. A page that loads its data asynchronously opens its
  // detail (a modal) after the app has mounted, so the curtain is raised again once the page has finished.
  const raise = () => {
    const curtain = root.querySelector<HTMLElement>(".intro-curtain");
    if (!root.dataset.intro || !curtain?.showPopover) return;
    if (curtain.matches(":popover-open")) curtain.hidePopover();
    curtain.showPopover();
  };
  nuxtApp.hook("page:finish", raise);

  nuxtApp.hook("app:mounted", async () => {
    const curtain = root.querySelector<HTMLElement>(".intro-curtain");
    raise();
    let letters: HTMLElement[] = [];
    let sub: HTMLElement | undefined;
    try {
      // Wait for the fonts, but never longer than fontWaitMs from the start of the load.
      const budget = Math.max(0, INTRO.fontWaitMs - performance.now());
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, budget)),
      ]);

      const name = root.querySelector<HTMLElement>("[data-intro-name]");
      const nameWindow = root.querySelector<HTMLElement>("[data-intro-name-window]");
      if (!curtain || !name || !nameWindow) return;
      // "Welcome." only rises on Hello (the greeting in <main>, not the one behind a sheet).
      const stage = root.querySelector<HTMLElement>("main .hello-stage:not(.is-decorative)");
      letters = stage ? [...stage.querySelectorAll<HTMLElement>(".letter")] : [];
      sub = stage?.querySelector<HTMLElement>(".hello-sub") ?? undefined;
      const bands = [...curtain.querySelectorAll<HTMLElement>("[data-intro-band]")];

      const intro = playIntro({ curtain, bands, name, nameWindow, letters, sub }, mode);
      switcher.attach(intro);
      await intro.curtainGone;
      endCurtain(curtain);
      await intro.finished;
      // Hand the greeting back to its CSS (the greeting's own motion uses `translate`, not these). Wait a
      // frame: Motion writes the final values once more in the frame where it finishes.
      await new Promise(requestAnimationFrame);
      for (const element of [...letters, sub]) element?.style.removeProperty("transform");
      for (const element of [...letters, sub]) element?.style.removeProperty("opacity");
    } finally {
      // Whatever happened, the curtain goes and the page is readable.
      endCurtain(curtain);
      for (const type of inputs) window.removeEventListener(type, skip, { capture: true });
    }
  });

  function endCurtain(curtain: HTMLElement | null) {
    delete root.dataset.intro;
    if (curtain?.matches(":popover-open")) curtain.hidePopover();
  }
});
