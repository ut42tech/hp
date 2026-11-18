import { readFileSync } from "node:fs";
import { profile } from "@ut42tech/profile";
import { expect, test } from "vite-plus/test";
import { loadPage } from "./html";

const css = readFileSync(new URL("../app/assets/css/global.css", import.meta.url), "utf8");

test.each(["/ja/", "/ja/about"])("%s carries the curtain with five bands and the name", (route) => {
  const curtain = loadPage(route).querySelector(".intro-curtain")!;
  expect(curtain.getAttribute("aria-hidden")).toBe("true");
  expect(curtain.querySelectorAll("[data-intro-band]")).toHaveLength(5);
  expect(curtain.querySelector("[data-intro-name]")!.textContent.trim()).toBe(profile.name);
});

test("the gate runs in <head> before first paint", () => {
  const scripts = loadPage("/ja/")
    .querySelectorAll("head script")
    .map((s) => s.textContent);
  expect(scripts.some((s) => s.includes("ut42tech:intro") && s.includes("dataset.intro"))).toBe(
    true,
  );
});

// If the intro never starts (the app failed to load), the curtain must not stay forever.
test("the curtain shows only while an intro plays and has a CSS failsafe", () => {
  expect(css).toMatch(/\.intro-curtain \{[^}]*display: none/);
  expect(css).toMatch(
    /html\[data-intro\] \.intro-curtain \{[^}]*animation: intro-failsafe 0s 5000ms forwards/,
  );
  expect(css).toMatch(/@keyframes intro-failsafe \{[^}]*visibility: hidden/);
});

// A press during the entrance reaches what is under the curtain (the skip listens on the window).
test("the curtain never catches presses", () => {
  expect(css).toMatch(/html\[data-intro\] \.intro-curtain \{[^}]*pointer-events: none/);
});

// If the app never starts, the greeting must not stay hidden: it shows itself with the curtain's failsafe.
test("the hidden greeting reveals itself with the failsafe", () => {
  expect(css).toMatch(/\.letter \{[^}]*animation: intro-reveal 0s 5000ms forwards/);
  expect(css).toMatch(/\.hello-sub \{[^}]*animation: intro-reveal 0s 5000ms forwards/);
  expect(css).toMatch(/@keyframes intro-reveal \{[^}]*opacity: 1;[^}]*transform: none/);
});

// A shared link to an app detail opens it as a modal (top layer); the curtain must still cover it, so it is
// raised into the top layer too, after the detail.
test("the curtain can be raised into the top layer above a modal detail", () => {
  expect(loadPage("/ja/").querySelector(".intro-curtain")!.getAttribute("popover")).toBe("manual");
  const plugin = readFileSync(new URL("../app/plugins/intro.client.ts", import.meta.url), "utf8");
  expect(plugin).toMatch(/showPopover\(\)/);
  expect(plugin).toMatch(/hidePopover\(\)/);
  expect(plugin).toMatch(/finally/);
});
