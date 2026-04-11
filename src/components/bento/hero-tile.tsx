import Image from "next/image";

import { Card } from "@/components/ui/card";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

interface HeroTileProps {
  className?: string;
}

export function HeroTile({ className }: HeroTileProps) {
  return (
    <Card
      className={cn(
        "relative flex flex-col justify-between gap-8 overflow-hidden rounded-3xl border-border bg-card p-8 md:flex-row md:items-end md:p-10",
        className,
      )}
    >
      <div className="flex flex-col gap-6">
        <p className="text-sm font-medium text-muted-foreground">Portfolio</p>
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">
            {profile.name}
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            {profile.role}
          </p>
        </div>
      </div>
      {profile.image ? (
        <div className="relative size-28 shrink-0 overflow-hidden rounded-full border border-border shadow-lg md:size-40">
          <Image
            src={profile.image}
            alt={profile.name}
            fill
            sizes="(min-width: 768px) 10rem, 7rem"
            className="object-cover"
            priority
          />
        </div>
      ) : null}
    </Card>
  );
}
