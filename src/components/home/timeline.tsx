"use client";

import { MapPin } from "lucide-react";
import { useId, useState } from "react";

import { Section } from "@/components/home/section";
import type { TimelineCategory, TimelineEntry } from "@/content/types";
import { cn } from "@/lib/utils";

const categoryConfig: Record<TimelineCategory, { label: string; dot: string }> =
  {
    life: { label: "life", dot: "bg-cat-life" },
    education: { label: "education", dot: "bg-cat-education" },
    work: { label: "work", dot: "bg-cat-work" },
    event: { label: "event", dot: "bg-cat-event" },
    other: { label: "other", dot: "bg-cat-other" },
  };

function formatDate(date: string): string {
  const [year, month] = date.split("-");
  return month ? `${year}.${month}` : (year ?? date);
}

type Row =
  | { type: "year"; year: string }
  | { type: "entry"; entry: TimelineEntry };

interface TimelineProps {
  featured: TimelineEntry[];
  all: TimelineEntry[];
}

/**
 * 年表。既定は主要項目のみ、「すべて見る」で全件（life 含む）を表示する。
 * Section は Server 専用の処理を持たないので、このクライアントファイル内で使う。
 */
export function Timeline({ featured, all }: TimelineProps) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const canToggle = featured.length !== all.length;
  const entries = expanded ? all : featured;

  const rows: Row[] = [];
  let currentYear: string | null = null;
  for (const entry of entries) {
    const year = entry.date.slice(0, 4);
    if (year !== currentYear) {
      rows.push({ type: "year", year });
      currentYear = year;
    }
    rows.push({ type: "entry", entry });
  }

  return (
    <Section id="timeline" label="Timeline">
      <ol id={listId} className="flex flex-col">
        {rows.map((row, index) => {
          const isLast = index === rows.length - 1;
          const lineSegment = !isLast ? (
            <div className="w-px flex-1 bg-border" />
          ) : null;

          if (row.type === "year") {
            return (
              <li key={`year-${row.year}`} className="relative flex gap-4">
                <div className="flex w-5 flex-col items-center">
                  <span
                    aria-hidden
                    className="size-3.5 shrink-0 rounded-full border-2 border-muted-foreground bg-background ring-4 ring-background"
                  />
                  {lineSegment}
                </div>
                <div className="flex flex-1 items-center gap-3 pb-6">
                  <span className="text-base font-bold tracking-tight tabular-nums text-foreground">
                    {row.year}
                  </span>
                  <span aria-hidden className="h-px flex-1 bg-border" />
                </div>
              </li>
            );
          }

          const { entry } = row;
          const config = categoryConfig[entry.category];
          const nextIsYear = rows[index + 1]?.type === "year";

          return (
            <li
              key={`${entry.date}-${entry.title}`}
              className="relative flex gap-4"
            >
              <div className="flex w-5 flex-col items-center">
                <span
                  aria-hidden
                  className={cn(
                    "size-2.5 shrink-0 rounded-full ring-4 ring-background",
                    config.dot,
                  )}
                />
                {lineSegment}
              </div>
              <div
                className={cn(
                  "flex min-w-0 flex-1 flex-col gap-1.5",
                  nextIsYear ? "pb-10" : "pb-6",
                )}
              >
                <time className="text-sm font-semibold tabular-nums text-accent">
                  {formatDate(entry.date)}
                </time>
                <h3 className="break-words text-base font-bold leading-snug">
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
            </li>
          );
        })}
      </ol>

      {canToggle ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 inline-flex min-h-11 cursor-pointer items-center text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
        >
          {expanded
            ? "主要な項目だけ表示"
            : `すべて見る（全 ${all.length} 件）`}
        </button>
      ) : null}
    </Section>
  );
}
