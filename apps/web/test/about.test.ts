import { existsSync } from "node:fs";
import { profile } from "@ut42tech/profile";
import { expect, test } from "vite-plus/test";
import { loadPage } from "./html";

const about = loadPage("/ja/about");

test("renders identity and contact without JavaScript", () => {
  expect(about.textContent).toContain(profile.name);
  expect(about.textContent).toContain(profile.motto);
  expect(
    about.querySelector('nav[aria-label="メイン"] [aria-current="page"]')!.getAttribute("href"),
  ).toBe("/ja/about");
  const contact = about.querySelector("#contact")!;
  for (const link of profile.social) {
    expect(contact.querySelector(`a[href="${link.href}"]`), link.label).not.toBeNull();
  }
  expect(contact.querySelector(`a[href="mailto:${profile.email}"]`)).not.toBeNull();
});

test("skills are labelled icons", () => {
  expect(about.querySelectorAll("[data-skill][aria-label]").length).toBe(11);
});

test("no research link yet", () => expect(about.textContent).not.toContain("研究について"));

test("one h1", () => expect(about.querySelectorAll("h1").length).toBe(1));

test("the profile photo is served resized from packages/assets", () => {
  const img = about.querySelector("img.photo")!;
  const urls = img
    .getAttribute("srcset")!
    .split(",")
    .map((candidate) => candidate.trim().split(" ")[0]!);
  expect(urls.length).toBeGreaterThan(1);
  for (const url of urls)
    expect(existsSync(new URL(`../.output/public${url}`, import.meta.url)), url).toBe(true);
});
