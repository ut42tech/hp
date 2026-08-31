"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface BentoMotionContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Bento グリッド全体の stagger コンテナ。子要素が順番に fade-in する。
 */
export function BentoMotionContainer({
  children,
  className,
}: BentoMotionContainerProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: reduce
            ? {}
            : {
                staggerChildren: 0.08,
                delayChildren: 0.05,
              },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface BentoTileMotionProps {
  children: ReactNode;
  className?: string;
}

/**
 * 個々の Bento タイル用ラッパー。親の stagger に合わせて fade + slide-up する。
 * `prefers-reduced-motion` を尊重し、低減設定なら動かさず即座に表示する。
 */
export function BentoTileMotion({ children, className }: BentoTileMotionProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: reduce
            ? { duration: 0 }
            : {
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
