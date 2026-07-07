import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { formatPressDate } from "@/components/press/press-meta";
import { Card } from "@/components/ui/card";
import type { PressItem } from "@/content/types";
import { cn } from "@/lib/utils";

interface PressTeaserTileProps {
  items: PressItem[];
  className?: string;
}

export function PressTeaserTile({ items, className }: PressTeaserTileProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-4 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Press</h2>
        <Link
          href="/press"
          className="inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          View all
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">掲載情報は準備中です。</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.url || item.title}>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col gap-1 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="text-[10px] font-bold uppercase tracking-wide text-accent">
                  {item.outlet}
                </span>
                <span className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                  {item.title}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatPressDate(item.date)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
