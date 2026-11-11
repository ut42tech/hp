import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionProps {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * ホームの共通セクション。小さな大文字ラベル＋細い区切り線を見出しとし、
 * セクション間の縦余白（py-12 md:py-16）をここで一元管理する。
 */
export function Section({ id, label, children, className }: SectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("py-12 md:py-16", className)}
    >
      <div className="mb-6 flex items-center gap-4">
        <h2
          id={headingId}
          className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
        >
          {label}
        </h2>
        <div className="h-px flex-1 bg-border" aria-hidden />
      </div>
      {children}
    </section>
  );
}
