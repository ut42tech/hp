"use client";

import { animate } from "motion/react";
import { useEffect, useLayoutEffect, useState } from "react";

import { cn } from "@/lib/utils";

// ブラウザでのみ useLayoutEffect（描画前にスクランブルへ差し替える）。
// SSR では useEffect。初回描画は確定テキストなのでハイドレーション安全。
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// 記号中心のグリフ集合（Motion+ の symbols プリセット風）。
const GLYPHS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~";

function randomGlyph(): string {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

interface ScrambleTextProps {
  /** 最終的に表示する確定テキスト。 */
  text: string;
  className?: string;
  /** スクランブルしている時間（ms）。Motion+ の既定は約 1 秒。 */
  durationMs?: number;
}

/**
 * Motion+ の ScrambleText を無料の motion で再現したもの。
 * 全文字を同時にランダムな記号へ化けさせ続け、最後に一斉に確定させる
 * （左→右の順次確定ではなく同時に終了）。毎フレーム差し替えて高速に明滅させる。
 *
 * 表示は絶対配置のオーバーレイにし、不可視サイザーで幅・高さを確定テキストに固定する。
 * これによりスクランブル中も見出しがガタつかず、折り返しのちらつきも起きない。
 */
export function ScrambleText({
  text,
  className,
  durationMs = 850,
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);

  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(text);
      return;
    }

    // 全文字を同時にスクランブルし続け、最後に一斉に確定させる。
    const controls = animate(0, 1, {
      duration: durationMs / 1000,
      ease: "linear",
      onUpdate: () => {
        let out = "";
        for (let i = 0; i < text.length; i += 1) {
          // 空白は崩さず語の区切りを保つ。
          out += text[i] === " " ? " " : randomGlyph();
        }
        setDisplay(out);
      },
      onComplete: () => setDisplay(text),
    });

    return () => controls.stop();
  }, [text, durationMs]);

  return (
    <span className={cn("relative inline-block align-baseline", className)}>
      {/* レイアウト確保用：確定テキストで幅・高さを固定（不可視）。
          overlay と同じく nowrap にして、狭幅でも常に1行・同一ジオメトリに保つ。 */}
      <span aria-hidden className="invisible select-none whitespace-nowrap">
        {text}
      </span>
      {/* スクランブル中の表示（絶対配置でレイアウトに影響させない）。 */}
      <span aria-hidden className="absolute top-0 left-0 whitespace-nowrap">
        {display}
      </span>
      {/* スクリーンリーダー向けの確定テキスト。 */}
      <span className="sr-only">{text}</span>
    </span>
  );
}
