import { readFileSync } from "node:fs";
import { describe, expect, test } from "vite-plus/test";

const read = (file: string) => readFileSync(new URL(file, import.meta.url), "utf8");

function colorTokens(block: string): Set<string> {
  return new Set([...block.matchAll(/(--ut-color-[\w-]+)\s*:/g)].map((m) => m[1]!));
}

function blockAfter(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start + selector.length);
  const close = css.indexOf("}", open);
  return css.slice(open + 1, close);
}

describe("tokens.css", () => {
  test("dark mode defines every light color token", () => {
    const css = read("./tokens.css");
    const light = colorTokens(blockAfter(css, ":root {"));
    const systemDark = colorTokens(blockAfter(css, ':root:not([data-theme="light"])'));
    const forcedDark = colorTokens(blockAfter(css, ':root[data-theme="dark"]'));

    expect(light.size).toBeGreaterThan(0);
    expect(systemDark).toEqual(light);
    expect(forcedDark).toEqual(light);
  });
});

function color(mode: "light" | "dark", name: string): string {
  const css = read("./tokens.css");
  const block = blockAfter(css, mode === "light" ? ":root {" : ':root[data-theme="dark"]');
  const match = block.match(new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{6})\\s*;`));
  if (!match) throw new Error(`${name} is not a #RRGGBB value in ${mode} mode`);
  return match[1]!;
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

describe("contrast (WCAG AA)", () => {
  const pairs: [fg: string, bg: string, min: number][] = [
    ["--ut-color-fg", "--ut-color-bg", 16],
    ["--ut-color-muted", "--ut-color-bg", 4.5],
    ["--ut-color-muted", "--ut-color-surface", 4.5],
    ["--ut-color-on-bar", "--ut-color-bar-active", 4.5],
    ["--ut-color-on-bar-muted", "--ut-color-bar", 4.5],
    ["--ut-color-on-curtain", "--ut-color-curtain", 4.5],
  ];
  test.each(["light", "dark"] as const)("%s mode meets the minimums", (mode) => {
    for (const [fg, bg, min] of pairs) {
      expect(contrast(color(mode, fg), color(mode, bg)), `${fg} on ${bg}`).toBeGreaterThanOrEqual(
        min,
      );
    }
  });
});

describe("theme.css", () => {
  test("maps radius, shadow and type tokens", () => {
    const theme = read("./theme.css");
    for (const name of [
      "--radius-card",
      "--radius-row",
      "--radius-sheet",
      "--radius-control",
      "--shadow-float",
      "--shadow-sheet",
    ])
      expect(theme).toContain(name);
    for (const utility of ["text-display", "text-title-l", "text-card-title", "text-mono"])
      expect(theme).toContain(`@utility ${utility}`);
  });

  test("dark: variant follows data-theme, not only the OS", () => {
    expect(read("./theme.css")).toContain(
      "@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));",
    );
  });

  test("theme.css maps every color token", () => {
    const light = colorTokens(blockAfter(read("./tokens.css"), ":root {"));
    const theme = blockAfter(read("./theme.css"), "@theme inline");

    for (const token of light) {
      const name = token.replace("--ut-", "--");
      expect(theme).toContain(`${name}: var(${token})`);
    }
  });
});
