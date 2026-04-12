"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import type { PhotoEntry } from "@/content/types";
import { cn } from "@/lib/utils";

interface PhotoTileProps {
  photo: PhotoEntry;
  className?: string;
}

export function PhotoTile({ photo, className }: PhotoTileProps) {
  const [open, setOpen] = useState(false);
  const hasCaption = Boolean(photo.caption);

  return (
    <Card
      className={cn(
        "relative aspect-photo overflow-hidden rounded-3xl border-border p-0 md:aspect-auto",
        className,
      )}
    >
      <button
        type="button"
        onClick={hasCaption ? () => setOpen((prev) => !prev) : undefined}
        aria-expanded={hasCaption ? open : undefined}
        aria-label={
          hasCaption ? `${photo.alt} のキャプションを表示` : photo.alt
        }
        disabled={!hasCaption}
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
        {hasCaption ? (
          <div
            aria-hidden={!open}
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/60 p-6 text-center text-white backdrop-blur-sm transition-opacity duration-300 md:p-8",
              open
                ? "opacity-100"
                : "pointer-events-none opacity-0 group-hover:opacity-40",
            )}
          >
            <p className="text-sm leading-relaxed md:text-base">
              {photo.caption}
            </p>
          </div>
        ) : null}
      </button>
    </Card>
  );
}
