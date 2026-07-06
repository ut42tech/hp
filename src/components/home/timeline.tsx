"use client";

import {
  Briefcase,
  GraduationCap,
  Heart,
  type LucideIcon,
  MapPin,
  Sparkles,
  Trophy,
} from "lucide-react";
import { type MotionProps, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

import type { TimelineCategory, TimelineEntry } from "@/content/types";
import { cn } from "@/lib/utils";

const categoryConfig: Record<
  TimelineCategory,
  { label: string; dot: string; icon: LucideIcon; avatar: string }
> = {
  life: {
    label: "life",
    dot: "bg-cat-life",
    icon: Heart,
    avatar: "bg-cat-life/15 text-cat-life",
  },
  education: {
    label: "education",
    dot: "bg-cat-education",
    icon: GraduationCap,
    avatar: "bg-cat-education/15 text-cat-education",
  },
  work: {
    label: "work",
    dot: "bg-cat-work",
    icon: Briefcase,
    avatar: "bg-cat-work/15 text-cat-work",
  },
  event: {
    label: "event",
    dot: "bg-cat-event",
    icon: Trophy,
    avatar: "bg-cat-event/15 text-cat-event",
  },
  other: {
    label: "other",
    dot: "bg-cat-other",
    icon: Sparkles,
    avatar: "bg-cat-other/15 text-cat-other",
  },
};

function formatDate(date: string): string {
  const [year, month] = date.split("-");
  return month ? `${year}.${month}` : (year ?? date);
}

type Row =
  | { type: "year"; year: string }
  | { type: "entry"; entry: TimelineEntry };

interface TimelineProps {
  entries: TimelineEntry[];
  className?: string;
}

export function Timeline({ entries, className }: TimelineProps) {
  const reduce = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<TimelineCategory | "all">(
    "all",
  );

  const counts = entries.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<TimelineCategory, number>,
  );

  // categoryConfig のキー順（life→…→other）で安定したフィルタ並びにする。
  const presentCategories = (
    Object.keys(categoryConfig) as TimelineCategory[]
  ).filter((c) => counts[c]);

  const filters: {
    value: TimelineCategory | "all";
    label: string;
    count: number;
    dot?: string;
  }[] = [
    { value: "all", label: "all", count: entries.length },
    ...presentCategories.map((c) => ({
      value: c,
      label: categoryConfig[c].label,
      count: counts[c],
      dot: categoryConfig[c].dot,
    })),
  ];

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  const filtered =
    activeFilter === "all"
      ? sorted
      : sorted.filter((e) => e.category === activeFilter);

  // 年見出しとエントリを 1 本のリストにフラット化し、git-graph レールを連続させる。
  const rows: Row[] = [];
  let currentYear: string | null = null;
  for (const entry of filtered) {
    const year = entry.date.slice(0, 4);
    if (year !== currentYear) {
      rows.push({ type: "year", year });
      currentYear = year;
    }
    rows.push({ type: "entry", entry });
  }

  // スクロールで各行を順次フェードイン。reduced-motion なら即時表示。
  const rowMotion: MotionProps = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <fieldset
        aria-label="タイムラインのカテゴリフィルター"
        className="flex flex-wrap gap-2 border-none p-0"
      >
        {filters.map((f) => {
          const active = activeFilter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              aria-pressed={active}
              onClick={() => setActiveFilter(f.value)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                active
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  f.dot ?? "border border-muted-foreground",
                )}
              />
              {f.label}
              <span className="tabular-nums text-muted-foreground/70">
                {f.count}
              </span>
            </button>
          );
        })}
      </fieldset>

      <ol aria-live="polite" className="flex flex-col">
        {rows.map((row, index) => {
          const isLast = index === rows.length - 1;
          const lineSegment = !isLast ? (
            <div className="w-px flex-1 bg-border" />
          ) : null;

          if (row.type === "year") {
            return (
              <motion.li
                key={`year-${row.year}`}
                {...rowMotion}
                className="relative flex gap-4"
              >
                <div className="flex w-10 flex-col items-center">
                  <span
                    aria-hidden
                    className="size-3.5 shrink-0 rounded-full border-2 border-muted-foreground bg-card ring-4 ring-card"
                  />
                  {lineSegment}
                </div>
                <div className="flex flex-1 items-center gap-3 pb-7">
                  <span className="text-base font-bold tracking-tight tabular-nums text-foreground">
                    {row.year}
                  </span>
                  <span aria-hidden className="h-px flex-1 bg-border" />
                </div>
              </motion.li>
            );
          }

          const { entry } = row;
          const config = categoryConfig[entry.category];
          const Icon = config.icon;
          // 次が年見出し＝時代の区切り。手前のエントリの余白を広げて段差を作る。
          // レール線は padding を満たすので連続性は保たれる。
          const nextIsYear = rows[index + 1]?.type === "year";

          return (
            <motion.li
              key={`${entry.date}-${entry.title}`}
              {...rowMotion}
              className="relative flex gap-4"
            >
              <div className="flex w-10 flex-col items-center">
                <span
                  aria-hidden
                  className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full ring-4 ring-card"
                >
                  {entry.thumbnail ? (
                    <Image
                      src={entry.thumbnail}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <span
                      className={cn(
                        "flex size-full items-center justify-center",
                        config.avatar,
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                  )}
                </span>
                {lineSegment}
              </div>
              <div
                className={cn(
                  "flex flex-1 flex-col gap-2 pt-2",
                  nextIsYear ? "pb-14" : "pb-8",
                )}
              >
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <time className="text-sm font-semibold tabular-nums text-accent">
                    {formatDate(entry.date)}
                  </time>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <span
                      aria-hidden
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        config.dot,
                      )}
                    />
                    {config.label}
                  </span>
                </div>
                <h3 className="text-base font-bold leading-snug md:text-lg">
                  {entry.title}
                </h3>
                {entry.description ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {entry.description}
                  </p>
                ) : null}
                {entry.location ? (
                  <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={12} className="size-3 shrink-0" />
                    {entry.location}
                  </p>
                ) : null}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
