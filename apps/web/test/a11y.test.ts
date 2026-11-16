import { expect, test } from "vite-plus/test";
import { appRoutes, loadPage } from "./html";

const routes = [
  "/ja/",
  "/ja/about",
  "/ja/works/apps",
  "/ja/works/career",
  "/ja/works/awards",
  "/ja/works/events",
  "/ja/press",
  ...appRoutes("ja"),
];

test.each(routes)("%s: every link and button has a name", (route) => {
  for (const el of loadPage(route).querySelectorAll("a, button")) {
    const name = el.getAttribute("aria-label") ?? el.textContent.trim();
    expect(name.length, el.outerHTML.slice(0, 120)).toBeGreaterThan(0);
  }
});

test.each(routes)("%s: interactive elements opt into the pointer", (route) => {
  for (const el of loadPage(route).querySelectorAll("a, button")) {
    expect(el.hasAttribute("data-cursor"), el.outerHTML.slice(0, 120)).toBe(true);
  }
});

test.each(routes)("%s: one h1", (route) => {
  expect(loadPage(route).querySelectorAll("h1").length).toBe(1);
});
