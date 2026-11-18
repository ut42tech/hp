import { existsSync, readFileSync } from "node:fs";
import { parse } from "node-html-parser";
import { expect, test } from "vite-plus/test";
import { readDist } from "./html";

const page = parse(readDist("404.html"));

test("says the page is missing and links home", () => {
  expect(page.querySelector("h1")!.textContent).toBe("ページが見つかりません");
  expect(page.querySelectorAll("h1").length).toBe(1);
  expect(page.querySelector('main a[href="/ja/"]')).not.toBeNull();
});

test("keeps the nav bar with nothing selected", () => {
  expect(page.querySelectorAll('nav[aria-label="メイン"] a').length).toBe(3);
  expect(page.querySelector('nav [aria-current="page"]')).toBeNull();
});

test("is not indexed and claims no address of its own", () => {
  expect(page.querySelector('meta[name="robots"]')!.getAttribute("content")).toBe("noindex");
  expect(page.querySelector('link[rel="canonical"]')).toBeNull();
  expect(page.querySelector('link[rel="alternate"]')).toBeNull();
});

// Vercel answers missing URLs with 404.html only for a plain static folder; Nuxt's own Vercel output
// carries no such rule and shows Vercel's generic page instead.
test("Vercel deploys the static folder, so 404.html answers missing URLs", () => {
  const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  expect(config).toMatchObject({ framework: null, outputDirectory: ".output/public" });
  const nuxtConfig = readFileSync(new URL("../nuxt.config.ts", import.meta.url), "utf8");
  expect(nuxtConfig).toMatch(/preset: "static"/);
});

// Static hosts serve 200.html for every missing URL (a client-only fallback); with it present, a wrong
// address would answer 200 with an empty shell instead of the 404 page.
test("there is no catch-all 200.html", () => {
  expect(existsSync(new URL("../.output/public/200.html", import.meta.url))).toBe(false);
});

// The 404 stands on the Hello ground itself; the greeting behind sheets would print over it.
test("the greeting is not drawn behind the 404", () => {
  expect(page.querySelector(".hello-stage")).toBeNull();
});
