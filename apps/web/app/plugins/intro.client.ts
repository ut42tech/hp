import { INTRO } from "@ut42tech/tokens/motion";
import { defineNuxtPlugin } from "#imports";
import { playIntro } from "~/motion/intro";

// Plays the entrance when the inline gate in <head> chose one (html[data-intro], components/SiteShell.vue).
export default defineNuxtPlugin((nuxtApp) => {
  const root = document.documentElement;
  const mode = root.dataset.intro;
  if (mode !== "play" && mode !== "fade") return;

  nuxtApp.hook("app:mounted", async () => {
    // Wait for the fonts, but never longer than fontWaitMs from the start of the load.
    const budget = Math.max(0, INTRO.fontWaitMs - performance.now());
    await Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, budget)),
    ]);

    const curtain = root.querySelector<HTMLElement>(".intro-curtain");
    const name = root.querySelector<HTMLElement>("[data-intro-name]");
    if (!curtain || !name) {
      delete root.dataset.intro;
      return;
    }
    // "Welcome." only rises on Hello (the greeting in <main>, not the one behind a sheet).
    const stage = root.querySelector<HTMLElement>("main .hello-stage:not(.is-decorative)");
    const letters = stage ? [...stage.querySelectorAll<HTMLElement>(".letter")] : [];
    const sub = stage?.querySelector<HTMLElement>(".hello-sub") ?? undefined;
    const bands = [...curtain.querySelectorAll<HTMLElement>("[data-intro-band]")];

    const intro = playIntro({ curtain, bands, name, letters, sub }, mode);

    // A key, the wheel or a press finishes the entrance at once. The press is not stopped, so whatever was
    // pressed still works.
    const skip = () => intro.skip();
    const inputs = ["keydown", "wheel", "pointerdown"] as const;
    for (const type of inputs)
      window.addEventListener(type, skip, { once: true, capture: true, passive: true });

    await intro.curtainGone;
    delete root.dataset.intro;
    await intro.finished;
    for (const type of inputs) window.removeEventListener(type, skip, { capture: true });
    // Hand the greeting back to its CSS (the greeting's own motion uses `translate`, not these). Wait a frame:
    // Motion writes the final values once more in the frame where it finishes.
    await new Promise(requestAnimationFrame);
    for (const element of [...letters, sub]) element?.style.removeProperty("transform");
    for (const element of [...letters, sub]) element?.style.removeProperty("opacity");
  });
});
