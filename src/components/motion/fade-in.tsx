"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * 単純な fade + slide-up 演出（ビューポートに入ったとき一度だけ再生）。Apple 風の ease-out カーブを使う。
 * SSR・JS 無効・印刷・クローラでは常に表示し、マウント後に（動きを減らす設定でなく、かつ要素が
 * ビューポートより下にある場合のみ）非表示の初期状態へ切り替えてから、ビューポートに入ったときに再生する。
 * `useReducedMotion` は SSR/ハイドレーション中は null なので `=== false` で判定する。
 */
export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (reduce !== false) return;
    // すでにビューポート内・上方にある要素は隠さない（ちらつき防止）。完全に下にある要素のみ arm する。
    const el = ref.current;
    if (el && el.getBoundingClientRect().top >= window.innerHeight) {
      setArmed(true);
    }
  }, [reduce]);

  const hidden = armed && !inView;

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={hidden ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }}
      transition={
        hidden
          ? { duration: 0 }
          : { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}
