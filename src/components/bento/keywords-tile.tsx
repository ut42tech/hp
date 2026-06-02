"use client";

import { useEffect, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { keywords } from "@/content/keywords";
import { cn } from "@/lib/utils";

import { computeKeywordLayout, type KeywordNode } from "./keywords-layout";

const PAD = "7px 14px"; // keywords-layout の PAD_Y/PAD_X と一致させる

export function KeywordsTile({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // SSR / 初回描画用に既定サイズでレイアウトしておく（テキストがクロール可能）
  const [nodes, setNodes] = useState<KeywordNode[]>(() =>
    computeKeywordLayout(keywords, { width: 600, height: 460 }),
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width < 10 || height < 10) return;
      setNodes(computeKeywordLayout(keywords, { width, height }));
    });
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
        {nodes.map((n, i) => (
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
                className={cn(
                  "inline-flex cursor-default whitespace-nowrap rounded-full border transition-transform duration-150",
                  "hover:scale-110 hover:border-accent hover:bg-accent hover:text-accent-foreground",
                  n.accent
                    ? "border-accent/40 bg-accent/10 text-foreground"
                    : "border-border bg-muted text-foreground",
                )}
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
        ))}
      </div>
    </Card>
  );
}
