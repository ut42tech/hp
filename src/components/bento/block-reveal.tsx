"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// clip-path の各状態。inset(top right bottom left)。
const CLIP_FROM_RIGHT = "inset(0 100% 0 0)"; // 右側を全クリップ＝不可視（左端のみ）
const CLIP_FULL = "inset(0 0 0 0)"; // クリップなし＝全面表示
const CLIP_TO_LEFT = "inset(0 0 0 100%)"; // 左側を全クリップ＝不可視（右へ抜けた状態）

// 「覆う → 保持 → めくる」を一本のタイムラインで。
const DURATION = 0.75;
const TIMES = [0, 0.34, 0.4, 1];
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface BlockRevealProps {
  children: ReactNode;
  /** 開始までの待ち（秒）。順番に出す stagger 用。 */
  delay?: number;
  className?: string;
  /** マスクバーの色。既定はテキスト色（currentColor）に追従する。 */
  barClassName?: string;
  /**
   * block: コンテンツを inline-block でなく block（＝コンテナ幅いっぱい）で組む。
   * 既定の inline-block はテキストの固有幅ぴったりに縮こまるため、文字列の幅が
   * 整数ピクセル境界に乗ると WebKit のサブピクセル丸めで 1↔2 行が不定に揺れる
   * （"Takuya Uehara" の折り返し問題）。block ならコンテナ幅で折り返し判定が
   * 決まり、余白がある限り確定的に1行になる。長い見出し用。
   */
  block?: boolean;
}

/**
 * テキストと同色の長方形マスクが「左→右へ伸びて覆い、左→右へ縮んで抜ける」2段スイープで
 * 中身を登場させるブロックリビール。マスクの通過跡からコンテンツが現れる。
 *
 * Motion の宣言的 initial を使うので、SSR の初回描画から「隠れた」状態で出力され、
 * ハイドレーション前に素の中身が見えるチラつき（FOUC）が起きない。
 * clip-path＋絶対配置オーバーレイなのでレイアウトシフトもない。
 * prefers-reduced-motion 時はアニメーションせず即表示（バーも描画しない）。
 *
 * 注意：演出は JS（クライアント）で開く。JS 無効時は中身が clip されたまま見えない
 * （DOM にテキストは存在するのでクローラ／スクリーンリーダーは読める）。
 */
export function BlockReveal({
  children,
  delay = 0,
  className,
  barClassName,
  block = false,
}: BlockRevealProps) {
  const reduce = useReducedMotion();
  const box = block ? "block" : "inline-block";

  if (reduce) {
    return <span className={cn(box, className)}>{children}</span>;
  }

  const transition = { duration: DURATION, delay, times: TIMES, ease: EASE };

  return (
    <span className={cn("relative", box, className)}>
      {/* 中身：覆われている間は隠し、マスクが抜けるのと同期して左→右に現れる。 */}
      <motion.span
        className={box}
        initial={{ clipPath: CLIP_FROM_RIGHT }}
        animate={{
          clipPath: [
            CLIP_FROM_RIGHT,
            CLIP_FROM_RIGHT,
            CLIP_FROM_RIGHT,
            CLIP_FULL,
          ],
        }}
        transition={transition}
      >
        {children}
      </motion.span>
      {/* マスク：左→右に伸びて覆い、保持、左→右に縮んで抜ける。 */}
      <motion.span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          barClassName ?? "bg-current",
        )}
        initial={{ clipPath: CLIP_FROM_RIGHT }}
        animate={{
          clipPath: [CLIP_FROM_RIGHT, CLIP_FULL, CLIP_FULL, CLIP_TO_LEFT],
        }}
        transition={transition}
      />
    </span>
  );
}
