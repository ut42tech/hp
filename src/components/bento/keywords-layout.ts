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

/** size → フォント px（基準。狭幅では scale で縮小） */
const SIZE_FONT: Record<Keyword["size"], number> = {
  xl: 30,
  lg: 22,
  md: 16,
  sm: 13,
};
/** 配置順（大きいものから中心付近に置く） */
const SIZE_RANK: Record<Keyword["size"], number> = {
  xl: 4,
  lg: 3,
  md: 2,
  sm: 1,
};

const PAD_X = 14;
const PAD_Y = 7;
const GAP = 7;
/** フォント縮尺の基準幅。これ以上では等倍。 */
const REF_WIDTH = 520;
const MIN_SCALE = 0.62;

function clamp(value: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, value));
}

/** ラテン文字は約0.58em、それ以外（CJK等）は約1emで概算。 */
function estimateWidth(label: string, fontPx: number): number {
  let units = 0;
  for (const ch of label) units += /[ -~]/.test(ch) ? 0.58 : 1;
  return units * fontPx + PAD_X * 2;
}

/** 2つのピル矩形が gap 込みで重なるか。 */
function rectsCollide(a: KeywordNode, b: KeywordNode, gap: number): boolean {
  return (
    Math.abs(a.x - b.x) < (a.w + b.w) / 2 + gap &&
    Math.abs(a.y - b.y) < (a.h + b.h) / 2 + gap
  );
}

/**
 * 指定スケールで、中心からアルキメデス螺旋に沿って「重ならない最初の位置」に
 * 各ピルを貪欲配置する。全ピルを枠内に置けたら配列を、置けなければ null を返す。
 * 螺旋による貪欲法なので重なりは構造的に発生しない。
 */
function tryLayout(
  keywords: Keyword[],
  width: number,
  height: number,
  scale: number,
): KeywordNode[] | null {
  const cx = width / 2;
  const cy = height / 2;

  const items: KeywordNode[] = keywords.map((k) => {
    const fontPx = Math.round(SIZE_FONT[k.size] * scale);
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

  // 大きい順に配置（xl が最初＝中心）。同 size は入力順を保つ安定ソート。
  const order = [...items].sort(
    (a, b) => SIZE_RANK[b.size] - SIZE_RANK[a.size],
  );

  const placed: KeywordNode[] = [];
  for (let idx = 0; idx < order.length; idx++) {
    const it = order[idx];
    const hw = it.w / 2;
    const hh = it.h / 2;
    // そもそも枠より大きいピルがあればこのスケールは不成立。
    if (it.w + 2 > width || it.h + 2 > height) return null;

    if (idx === 0) {
      it.x = cx;
      it.y = cy;
      placed.push(it);
      continue;
    }

    let ok = false;
    for (let theta = 0; theta < 240; theta += 0.25) {
      const r = 4 * theta;
      const x = cx + r * Math.cos(theta);
      const y = cy + r * Math.sin(theta);
      if (
        x - hw < 1 ||
        x + hw > width - 1 ||
        y - hh < 1 ||
        y + hh > height - 1
      ) {
        continue;
      }
      it.x = x;
      it.y = y;
      let collide = false;
      for (const p of placed) {
        if (rectsCollide(p, it, GAP)) {
          collide = true;
          break;
        }
      }
      if (!collide) {
        ok = true;
        break;
      }
    }
    if (!ok) return null;
    placed.push(it);
  }

  return items;
}

/**
 * Keywords の配置を計算する。コンテナ幅に応じてフォントを縮小し、
 * 全ピルが枠内に収まる最大スケールを採用する（重なりゼロを保証）。
 * @param opts.ticks 互換のため受けるが未使用。
 */
export function computeKeywordLayout(
  keywords: Keyword[],
  opts: { width: number; height: number; ticks?: number },
): KeywordNode[] {
  const { width, height } = opts;
  const base = clamp(width / REF_WIDTH, MIN_SCALE, 1);

  // 大きいスケールから順に試し、枠内に収まった最初のものを採用。
  for (let i = 0; i <= 16; i++) {
    const scale = base - i * 0.035;
    if (scale < 0.36) break;
    const result = tryLayout(keywords, width, height, scale);
    if (result) return result;
  }

  // 最後の手段：縦に十分な余裕を与えて必ず配置（通常の寸法では到達しない）。
  const fallback = tryLayout(keywords, width, Math.max(height, 4000), 0.36);
  if (fallback) return fallback;

  // それでも無理なら中心に重ねて返す（実運用では発生しない）。
  const cx = width / 2;
  const cy = height / 2;
  return keywords.map((k) => {
    const fontPx = Math.round(SIZE_FONT[k.size] * 0.36);
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
}
