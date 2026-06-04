"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

// 左右端をなめらかにフェードさせる mask（枠線の代わりのクリーンな縁取り）。
const EDGE_FADE =
  "linear-gradient(to right, transparent, black 8%, black 92%, transparent)";

interface MarqueeProps {
  /** 流すテキスト群。区切りを挟んで連結し、シームレスにループする。 */
  items: string[];
  /** 1ループの秒数。大きいほどゆっくり。 */
  durationSec?: number;
  className?: string;
}

/**
 * テキストを左方向へスライドし続けるマーキー。同じ並びを2つ繋げて -50% まで動かし、
 * シームレスにループさせる。左右端は mask グラデーションでフェードさせ、枠線なしの
 * クリーンな見た目に。prefers-reduced-motion 時はスクロールせず静止表示する。
 */
export function Marquee({ items, durationSec = 18, className }: MarqueeProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{items.join("　/　")}</div>;
  }

  return (
    <div
      // min-w-0 + overflow-hidden: w-max の中身が親フレックスを押し広げないように
      // 封じ込める。isolate で stacking context を作り、translateX でコンポジット化
      // した子も WebKit で確実にクリップさせる。
      className={cn("relative isolate min-w-0 overflow-hidden", className)}
      style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
    >
      {/* スクリーンリーダー向けに正規テキストを一度だけ読ませる。 */}
      <span className="sr-only">{items.join(" / ")}</span>
      <motion.div
        aria-hidden
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: durationSec,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
        }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-center whitespace-nowrap"
          >
            {items.map((text) => (
              <span key={text} className="flex items-center">
                <span>{text}</span>
                {/* 区切りの小さなアクセントドット。 */}
                <span className="mx-6 inline-block size-1.5 shrink-0 rounded-full bg-accent" />
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
