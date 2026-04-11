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
 */
export function BentoTileMotion({ children, className }: BentoTileMotionProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
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
