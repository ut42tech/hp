"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import type { PhotoEntry } from "@/content/types";
import { cn } from "@/lib/utils";

interface GalleryCardProps {
  photo: PhotoEntry;
  className?: string;
}

export function GalleryCard({ photo, className }: GalleryCardProps) {
  const [open, setOpen] = useState(false);
  const hasOverlay = Boolean(photo.caption || photo.date);

  const formattedDate = photo.date
    ? new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(photo.date))
    : null;

  return (
    <Card
      className={cn(
        "relative aspect-square overflow-hidden rounded-3xl border-border p-0",
        className,
      )}
    >
      <button
        type="button"
        onClick={hasOverlay ? () => setOpen((prev) => !prev) : undefined}
        aria-expanded={hasOverlay ? open : undefined}
        aria-label={hasOverlay ? `${photo.alt} の詳細を表示` : photo.alt}
        disabled={!hasOverlay}
        className="group relative block size-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:cursor-default"
      >
        {/* biome-ignore lint/performance/noImgElement: SVG プレースホルダのため next/image を使わない */}
        <img
          src={photo.src}
          alt={photo.alt}
          className="size-full object-cover"
          loading="lazy"
          decoding="async"
        />
        {hasOverlay ? (
          <div
            aria-hidden={!open}
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 p-6 text-center text-white backdrop-blur-sm transition-opacity duration-300",
              open
                ? "opacity-100"
                : "pointer-events-none opacity-0 group-hover:opacity-100",
            )}
          >
            {formattedDate ? (
              <time
                dateTime={photo.date}
                className="text-xs font-medium tracking-wide opacity-80"
              >
                {formattedDate}
              </time>
            ) : null}
            {photo.caption ? (
              <p className="text-sm leading-relaxed">{photo.caption}</p>
            ) : null}
          </div>
        ) : null}
      </button>
    </Card>
  );
}
