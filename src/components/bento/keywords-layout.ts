import {
  forceCollide,
  forceManyBody,
  forceRadial,
  forceSimulation,
  type SimulationNodeDatum,
} from "d3-force";

import type { Keyword } from "@/content/types";

export interface KeywordNode {
  label: string;
  accent: boolean;
  size: Keyword["size"];
  fontPx: number;
  /** ピルの推定幅・高さ（px） */
  w: number;
  h: number;
  x: number;
  y: number;
}

type SimNode = KeywordNode & SimulationNodeDatum;

/** size → フォント px */
const SIZE_FONT: Record<Keyword["size"], number> = {
  xl: 30,
  lg: 22,
  md: 16,
  sm: 13,
};
/** size → 目標半径（コンテナ短辺の半分に対する比率）。xl は中心。 */
const SIZE_RADIUS_RATIO: Record<Keyword["size"], number> = {
  xl: 0,
  lg: 0.34,
  md: 0.6,
  sm: 0.85,
};

const PAD_X = 14;
const PAD_Y = 7;
const GAP = 8;

/** ラテン文字は約0.58em、それ以外（CJK等）は約1emで概算。 */
function estimateWidth(label: string, fontPx: number): number {
  let units = 0;
  for (const ch of label) units += /[ -~]/.test(ch) ? 0.58 : 1;
  return units * fontPx + PAD_X * 2;
}

export function computeKeywordLayout(
  keywords: Keyword[],
  opts: { width: number; height: number; ticks?: number },
): KeywordNode[] {
  const { width, height, ticks = 400 } = opts;
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) / 2;

  const nodes: SimNode[] = keywords.map((k) => {
    const fontPx = SIZE_FONT[k.size];
    return {
      label: k.label,
      accent: Boolean(k.accent),
      size: k.size,
      fontPx,
      w: estimateWidth(k.label, fontPx),
      h: fontPx + PAD_Y * 2,
      x: cx,
      y: cy,
    };
  });

  // 主役(xl)を中心にピン留め
  const center = nodes.find((n) => n.size === "xl");
  if (center) {
    center.fx = cx;
    center.fy = cy;
  }

  const sim = forceSimulation(nodes)
    // 外接円半径で衝突 → 矩形は確実に重ならない
    .force(
      "collide",
      forceCollide<SimNode>((d) => Math.hypot(d.w, d.h) / 2 + GAP).iterations(
        6,
      ),
    )
    .force(
      "radial",
      forceRadial<SimNode>(
        (d) => SIZE_RADIUS_RATIO[d.size] * maxR,
        cx,
        cy,
      ).strength(0.85),
    )
    .force("charge", forceManyBody().strength(-6))
    .stop();

  for (let i = 0; i < ticks; i++) sim.tick();

  return nodes.map(({ label, accent, size, fontPx, w, h, x, y }) => ({
    label,
    accent,
    size,
    fontPx,
    w,
    h,
    x: x ?? cx,
    y: y ?? cy,
  }));
}
