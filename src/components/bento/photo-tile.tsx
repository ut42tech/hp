import { Card } from "@/components/ui/card";
import type { PhotoEntry } from "@/content/types";
import { cn } from "@/lib/utils";

interface PhotoTileProps {
  photo: PhotoEntry;
  className?: string;
}

export function PhotoTile({ photo, className }: PhotoTileProps) {
  return (
    <Card
      className={cn(
        "relative aspect-photo overflow-hidden rounded-3xl border-border p-0 md:aspect-auto",
        className,
      )}
    >
      {/* biome-ignore lint/performance/noImgElement: SVG プレースホルダのため next/image を使わない */}
      <img
        src={photo.src}
        alt={photo.alt}
        className="size-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </Card>
  );
}
