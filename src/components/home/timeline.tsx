"use client";

import {
  Briefcase,
  CalendarDays,
  Circle,
  GraduationCap,
  MapPin,
  Sparkles,
} from "lucide-react";
import { type ComponentType, useState } from "react";

import { Badge } from "@/components/ui/badge";
import type { TimelineCategory, TimelineEntry } from "@/content/types";
import { cn } from "@/lib/utils";

const categoryConfig: Record<
  TimelineCategory,
  { icon: ComponentType<{ className?: string }>; label: string }
> = {
  life: { icon: Sparkles, label: "Life" },
  education: { icon: GraduationCap, label: "Education" },
  work: { icon: Briefcase, label: "Work" },
  event: { icon: CalendarDays, label: "Event" },
  other: { icon: Circle, label: "Other" },
};

function formatDate(date: string): string {
  const [year, month] = date.split("-");
  return month ? `${year}.${month}` : (year ?? date);
}

interface TimelineProps {
  entries: TimelineEntry[];
  className?: string;
}

export function Timeline({ entries, className }: TimelineProps) {
  const [activeFilter, setActiveFilter] = useState<TimelineCategory | "all">(
    "all",
  );

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));

  const presentCategories = [
    ...new Set(entries.map((e) => e.category)),
  ] as TimelineCategory[];

  const filters: { value: TimelineCategory | "all"; label: string }[] = [
    { value: "all", label: "All" },
    ...presentCategories
      .filter((cat) => cat in categoryConfig)
      .map((cat) => ({ value: cat, label: categoryConfig[cat].label })),
  ];

  const filtered =
    activeFilter === "all"
      ? sorted
      : sorted.filter((e) => e.category === activeFilter);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <fieldset
        aria-label="タイムラインのカテゴリフィルター"
        className="flex flex-wrap gap-2 border-none p-0"
      >
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={activeFilter === f.value}
            onClick={() => setActiveFilter(f.value)}
          >
            <Badge
              variant={activeFilter === f.value ? "default" : "secondary"}
              className="cursor-pointer transition-colors"
            >
              {f.label}
            </Badge>
          </button>
        ))}
      </fieldset>
      <ol aria-live="polite" className="flex flex-col">
        {filtered.map((entry, index) => {
          const config = categoryConfig[entry.category];
          const Icon = config.icon;
          const isLast = index === filtered.length - 1;

          return (
            <li
              key={`${entry.date}-${entry.title}`}
              className="relative flex gap-5"
            >
              <div className="flex flex-col items-center">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-accent">
                  <Icon className="size-4" />
                </div>
                {!isLast ? <div className="w-px flex-1 bg-border" /> : null}
              </div>
              <div
                className={cn(
                  "flex flex-1 flex-col gap-1.5",
                  !isLast && "pb-10",
                )}
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <time className="font-mono text-sm font-semibold text-accent">
                    {formatDate(entry.date)}
                  </time>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {config.label}
                  </p>
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
                    <MapPin className="size-3" />
                    {entry.location}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
