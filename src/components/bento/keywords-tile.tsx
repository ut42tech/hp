"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { keywords } from "@/content/keywords";
import { cn } from "@/lib/utils";

import { computeKeywordLayout, type KeywordNode } from "./keywords-layout";

const PAD = "7px 14px"; // keywords-layout の PAD_Y/PAD_X と一致させる

// ブラウザでのみ useLayoutEffect（描画前に計測）。SSR では useEffect（フック数を揃える）。
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function pillClass(accent: boolean): string {
  return cn(
    "inline-flex select-none whitespace-nowrap rounded-full border transition-colors duration-150",
    "hover:border-accent hover:bg-accent hover:text-accent-foreground",
    accent
      ? "border-accent/40 bg-accent/10 text-foreground"
      : "border-border bg-muted text-foreground",
  );
}

export function KeywordsTile({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  // コンテナを計測（クライアントのみ）。幅が大きく変わった時だけ更新し、物理の作り直しを抑える。
  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;
      setSize((prev) => {
        if (prev && Math.abs(Math.round(rect.width) - Math.round(prev.w)) < 8) {
          return prev;
        }
        return { w: rect.width, h: rect.height };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 初期配置（中心放射スパイラル）。物理の初期位置にも使う。
  const nodes = useMemo<KeywordNode[] | null>(
    () =>
      size
        ? computeKeywordLayout(keywords, { width: size.w, height: size.h })
        : null,
    [size],
  );

  // Matter.js でふわふわ＋ドラッグ（クライアント限定・動的import）。
  useEffect(() => {
    const el = containerRef.current;
    if (!nodes || !el) return;

    let disposed = false;
    let cleanup = () => {};

    import("matter-js").then((mod) => {
      if (disposed) return;
      const Matter = mod.default;
      const {
        Engine,
        Runner,
        Composite,
        Bodies,
        Body,
        Mouse,
        MouseConstraint,
      } = Matter;

      const rect = el.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      const cx = W / 2;
      const cy = H / 2;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      // 粗いポインタ（タッチ）ではドラッグを付けない＝ページスクロールを壊さない。
      const canDrag = window.matchMedia("(pointer: fine)").matches;

      const engine = Engine.create();
      engine.gravity.x = 0;
      engine.gravity.y = 0;

      // 衝突ボックスはピルより少し大きく作り、ピル同士に余白を持たせる。
      const SPACE = 10;
      const bodies = nodes.map((n) =>
        Bodies.rectangle(n.x, n.y, n.w + SPACE, n.h + SPACE, {
          chamfer: { radius: (Math.min(n.w, n.h) + SPACE) / 2 },
          frictionAir: 0.06,
          friction: 0,
          restitution: 0.6,
        }),
      );
      if (!reduceMotion) {
        bodies.forEach((b, i) => {
          const a = i * 2.399963; // 黄金角で初速の向きを散らす
          Body.setVelocity(b, { x: Math.cos(a) * 0.7, y: Math.sin(a) * 0.7 });
        });
      }

      const t = 140;
      const walls = [
        Bodies.rectangle(cx, -t / 2, W + t * 2, t, { isStatic: true }),
        Bodies.rectangle(cx, H + t / 2, W + t * 2, t, { isStatic: true }),
        Bodies.rectangle(-t / 2, cy, t, H + t * 2, { isStatic: true }),
        Bodies.rectangle(W + t / 2, cy, t, H + t * 2, { isStatic: true }),
      ];

      Composite.add(engine.world, [...bodies, ...walls]);

      let mc: ReturnType<typeof MouseConstraint.create> | null = null;
      if (canDrag) {
        const mouse = Mouse.create(el);
        mc = MouseConstraint.create(engine, {
          mouse,
          constraint: { stiffness: 0.2, render: { visible: false } },
        });
        Composite.add(engine.world, mc);
      }

      const runner = Runner.create();
      Runner.run(runner, engine);

      let raf = 0;
      const sync = () => {
        const grabbed = mc?.body ?? null;
        for (let i = 0; i < bodies.length; i++) {
          const b = bodies[i];
          if (!reduceMotion && b !== grabbed) {
            // 微風だけ与えて“ふわふわ”させる（中心引力は入れない＝中央で団子にならない）。
            const bx = (Math.random() - 0.5) * 0.00006 * b.mass;
            const by = (Math.random() - 0.5) * 0.00006 * b.mass;
            Body.applyForce(b, b.position, { x: bx, y: by });
          }
          const elp = pillRefs.current[i];
          if (elp) {
            elp.style.transform = `translate(${b.position.x}px, ${b.position.y}px) translate(-50%, -50%) rotate(${b.angle}rad)`;
          }
        }
        raf = requestAnimationFrame(sync);
      };
      raf = requestAnimationFrame(sync);

      cleanup = () => {
        cancelAnimationFrame(raf);
        Runner.stop(runner);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [nodes]);

  return (
    <Card
      className={cn(
        "flex flex-col gap-4 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <h2 className="text-lg font-bold">Keywords</h2>
      <div
        ref={containerRef}
        className="relative min-h-[460px] flex-1 overflow-hidden"
      >
        {nodes === null ? (
          // SSR / マウント前のフォールバック（座標計算なし＝ハイドレーション安全）。
          <ul className="flex flex-wrap content-start gap-2">
            {keywords.map((k) => (
              <li key={k.label}>
                <span
                  className={cn(
                    pillClass(Boolean(k.accent)),
                    "text-sm font-bold",
                  )}
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
              ref={(elp) => {
                pillRefs.current[i] = elp;
              }}
              className="absolute left-0 top-0 cursor-grab will-change-transform active:cursor-grabbing"
              style={{
                transform: `translate(${n.x}px, ${n.y}px) translate(-50%, -50%)`,
              }}
            >
              <span
                className={pillClass(n.accent)}
                style={{
                  fontSize: n.fontPx,
                  padding: PAD,
                  fontWeight: 700,
                }}
              >
                {n.label}
              </span>
            </span>
          ))
        )}
      </div>
    </Card>
  );
}
