import { Newspaper } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { PressItem } from "@/content/types";

import { formatPressDate, pressTypeLabel } from "./press-meta";

export function PressCard({ item }: { item: PressItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-border bg-card transition-colors group-hover:border-accent">
        <div className="relative aspect-[1.91/1] w-full overflow-hidden bg-muted">
          {item.thumbnail ? (
            // biome-ignore lint/performance/noImgElement: 外部媒体の可変ホストのため next/image を使わない
            <img
              src={item.thumbnail}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-accent/10 via-muted to-secondary text-muted-foreground">
              <Newspaper className="size-8 opacity-50" />
              <span className="px-3 text-center text-xs font-semibold">
                {item.outlet}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <span className="inline-flex w-fit items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
            {pressTypeLabel[item.type]}
          </span>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground">
            {item.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {item.outlet} ・{" "}
            <time dateTime={item.date}>{formatPressDate(item.date)}</time>
          </p>
          {item.excerpt ? (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {item.excerpt}
            </p>
          ) : null}
        </div>
      </Card>
    </a>
  );
}
