#!/usr/bin/env node
/**
 * レイアウト検査: `/` と `/blogs` を 375x812 / 1280x800 × light / dark で撮影し、
 * 横スクロールの発生と、375px の `/` における Intro のファーストビュー収まりを検査する。
 *
 * Usage: node scripts/check-layout.mjs <baseUrl> <outDir>
 * playwright はプロジェクトの依存に含めず、グローバルのものを使う。
 */
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const [baseUrl, outDir] = process.argv.slice(2);
if (!baseUrl || !outDir) {
  console.error("Usage: node scripts/check-layout.mjs <baseUrl> <outDir>");
  process.exit(2);
}

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require("playwright");
  } catch {
    const root = execSync("npm root -g").toString().trim();
    return require(path.join(root, "playwright"));
  }
}

const { chromium } = loadPlaywright();

const viewports = [
  { name: "375", width: 375, height: 812 },
  { name: "1280", width: 1280, height: 800 },
];
const schemes = ["light", "dark"];
const routes = [
  { path: "/", name: "home" },
  { path: "/blogs", name: "blogs" },
];
const introSelectors = [
  "[data-intro-name]",
  "[data-intro-headline]",
  "[data-intro-affiliation]",
  "[data-intro-social]",
];

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const failures = [];

for (const vp of viewports) {
  for (const scheme of schemes) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      colorScheme: scheme,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    for (const route of routes) {
      const label = `${route.name} ${vp.name} ${scheme}`;
      const res = await page.goto(new URL(route.path, baseUrl).toString(), {
        waitUntil: "networkidle",
      });
      if (!res || !res.ok()) {
        console.log(
          `FAIL http-status ${label} (${res ? res.status() : "no response"})`,
        );
        failures.push(
          `http-status: ${label} (${res ? res.status() : "no response"})`,
        );
      }

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      const overflowed = overflow.scrollWidth > overflow.clientWidth;
      console.log(
        `${overflowed ? "FAIL" : "ok  "} overflow-x  ${label} (${overflow.scrollWidth} / ${overflow.clientWidth})`,
      );
      if (overflowed) failures.push(`overflow-x: ${label}`);

      if (route.path === "/" && vp.name === "375") {
        for (const sel of introSelectors) {
          const bottom = await page.evaluate((s) => {
            const el = document.querySelector(s);
            return el ? el.getBoundingClientRect().bottom : null;
          }, sel);
          const ok = bottom !== null && bottom <= vp.height;
          console.log(
            `${ok ? "ok  " : "FAIL"} first-view   ${label} ${sel} bottom=${bottom === null ? "missing" : Math.round(bottom)}`,
          );
          if (!ok) failures.push(`first-view: ${label} ${sel}`);
        }
      }

      await page.screenshot({
        path: path.join(outDir, `${route.name}-${vp.name}-${scheme}.png`),
        fullPage: true,
      });
    }
    await context.close();
  }
}

await browser.close();
if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed:`);
  for (const f of failures) console.error(` - ${f}`);
  process.exit(1);
}
console.log("\nAll layout checks passed.");
