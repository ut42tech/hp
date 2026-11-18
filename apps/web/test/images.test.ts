import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";
import { loadPage } from "./html";

// Nuxt Image turns a bare "50vw" into a 1px width, so every `sizes` must name real widths.
test.each(["/ja/works/apps", "/ja/press", "/ja/about", "/ja/works/apps/coto2-ba"])(
  "%s: no image candidate is a few pixels wide",
  (route) => {
    for (const img of loadPage(route).querySelectorAll("img[srcset]")) {
      const widths = img
        .getAttribute("srcset")!
        .split(",")
        .map((candidate) => Number(candidate.trim().split(" ")[1]!.replace("w", "")));
      expect(Math.min(...widths), img.getAttribute("srcset")!).toBeGreaterThanOrEqual(64);
    }
  },
);

// "ipx" resolves to the static images when generating and to the on-demand server in `nuxt dev`;
// "ipxStatic" never mounts /_ipx in dev, so images 404 locally. Being explicit also keeps Vercel's
// runtime image provider from being picked automatically.
test("images use the ipx provider (static at build time, on demand in dev)", () => {
  const config = readFileSync(new URL("../nuxt.config.ts", import.meta.url), "utf8");
  expect(config).toMatch(/provider: "ipx"/);
});
