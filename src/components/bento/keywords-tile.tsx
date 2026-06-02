"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { keywords } from "@/content/keywords";
import { cn } from "@/lib/utils";

import { computeKeywordLayout, type KeywordNode } from "./keywords-layout";

const PAD = "7px 14px"; // keywords-layout の PAD_Y/PAD_X と一致させる

// ブラウザでのみ useLayoutEffect（描画前に配置を確定しチラつきを防ぐ）。
// SSR では useEffect（フックの個数を一致させるため／実行はされない）。
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function pillClass(accent: boolean): string {
  return cn(
    "inline-flex cursor-default whitespace-nowrap rounded-full border transition-transform duration-150",
    "hover:scale-110 hover:border-accent hover:bg-accent hover:text-accent-foreground",
    accent
      ? "border-accent/40 bg-accent/10 text-foreground"
      : "border-border bg-muted text-foreground",
  );
}

export function KeywordsTile({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // 座標は浮動小数で、サーバーとクライアントで最下位ビットが揃わずハイドレーション不一致になる。
  // そのため SSR/初回描画では座標を持たない単純な折り返し（クロール可・決定的）を出し、
  // マウント後にクライアントだけでクラウド配置を計算する（react-d3-cloud 等も推奨するクライアント限定描画）。
  const [nodes, setNodes] = useState<KeywordNode[] | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;
      setNodes(
        computeKeywordLayout(keywords, {
          width: rect.width,
          height: rect.height,
        }),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Card
      className={cn(
        "flex flex-col gap-4 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <h2 className="text-lg font-bold">Keywords</h2>
      <div ref={ref} className="relative min-h-[460px] flex-1">
        {nodes === null ? (
          // SSR / マウント前のフォールバック（座標計算なし＝ハイドレーション安全）。
          <ul className="flex flex-wrap content-start gap-2">
            {keywords.map((k) => (
              <li key={k.label}>
                <span
                  className={cn(pillClass(Boolean(k.accent)), "text-sm")}
                  style={{ padding: PAD }}
                >
                  {k.label}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          nodes.map((n, i) => (
            <span
              key={n.label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: n.x, top: n.y }}
            >
              <span
                className="kw-drift inline-block"
                style={{
                  animationDelay: `${(i % 7) * 0.4}s`,
                  animationDuration: `${6 + (i % 5)}s`,
                }}
              >
                <span
                  className={pillClass(n.accent)}
                  style={{
                    fontSize: n.fontPx,
                    padding: PAD,
                    fontWeight: n.size === "xl" || n.size === "lg" ? 700 : 500,
                  }}
                >
                  {n.label}
                </span>
              </span>
            </span>
          ))
        )}
      </div>
    </Card>
  );
}
