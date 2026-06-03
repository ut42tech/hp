import { describe, expect, it } from "vitest";

import { keywords } from "@/content/keywords";
import type { Keyword } from "@/content/types";

import { computeKeywordLayout } from "./keywords-layout";

const sample: Keyword[] = [
  { label: "Creative Engineer", size: "xl", accent: true },
  { label: "ものづくり", size: "lg" },
  { label: "Generative AI", size: "lg" },
  { label: "弓道", size: "lg" },
  { label: "3DCG", size: "md" },
  { label: "Community", size: "md" },
  { label: "WebXR", size: "sm" },
  { label: "Sauna", size: "sm" },
  { label: "OSS", size: "sm" },
  { label: "Homelab", size: "sm" },
];

function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return !(
    a.x + a.w / 2 <= b.x - b.w / 2 ||
    b.x + b.w / 2 <= a.x - a.w / 2 ||
    a.y + a.h / 2 <= b.y - b.h / 2 ||
    b.y + b.h / 2 <= a.y - a.h / 2
  );
}

describe("computeKeywordLayout", () => {
  it("どのピル同士も重ならない", () => {
    const nodes = computeKeywordLayout(sample, { width: 640, height: 440 });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        expect(rectsOverlap(nodes[i], nodes[j])).toBe(false);
      }
    }
  });

  it("xl の主役ワードは中心に固定される", () => {
    const nodes = computeKeywordLayout(sample, { width: 640, height: 440 });
    const center = nodes.find((n) => n.size === "xl");
    expect(center).toBeDefined();
    expect(center?.x).toBe(320);
    expect(center?.y).toBe(220);
  });

  it("全ノードの座標が有限数", () => {
    const nodes = computeKeywordLayout(sample, { width: 500, height: 380 });
    for (const n of nodes) {
      expect(Number.isFinite(n.x)).toBe(true);
      expect(Number.isFinite(n.y)).toBe(true);
    }
  });

  it("狭いコンテナでも全ピルが枠内に収まる（見切れ防止）", () => {
    const W = 300;
    const H = 400;
    const nodes = computeKeywordLayout(sample, { width: W, height: H });
    for (const n of nodes) {
      expect(n.x - n.w / 2).toBeGreaterThanOrEqual(-0.5);
      expect(n.x + n.w / 2).toBeLessThanOrEqual(W + 0.5);
      expect(n.y - n.h / 2).toBeGreaterThanOrEqual(-0.5);
      expect(n.y + n.h / 2).toBeLessThanOrEqual(H + 0.5);
    }
  });

  it("実データ全件がモバイル幅でも重ならず枠内に収まる", () => {
    const W = 300;
    const H = 460;
    const nodes = computeKeywordLayout(keywords, { width: W, height: H });
    expect(nodes.length).toBe(keywords.length);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        expect(rectsOverlap(nodes[i], nodes[j])).toBe(false);
      }
    }
    for (const n of nodes) {
      expect(n.x - n.w / 2).toBeGreaterThanOrEqual(-0.5);
      expect(n.x + n.w / 2).toBeLessThanOrEqual(W + 0.5);
      expect(n.y - n.h / 2).toBeGreaterThanOrEqual(-0.5);
      expect(n.y + n.h / 2).toBeLessThanOrEqual(H + 0.5);
    }
  });

  it("デスクトップ幅(等倍)でも重ならず枠内に収まる", () => {
    const W = 680;
    const H = 680;
    const nodes = computeKeywordLayout(keywords, { width: W, height: H });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        expect(rectsOverlap(nodes[i], nodes[j])).toBe(false);
      }
    }
    for (const n of nodes) {
      expect(n.x - n.w / 2).toBeGreaterThanOrEqual(-0.5);
      expect(n.x + n.w / 2).toBeLessThanOrEqual(W + 0.5);
      expect(n.y - n.h / 2).toBeGreaterThanOrEqual(-0.5);
      expect(n.y + n.h / 2).toBeLessThanOrEqual(H + 0.5);
    }
  });
});
