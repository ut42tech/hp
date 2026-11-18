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
