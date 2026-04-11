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
        "relative flex flex-col items-center gap-8 overflow-hidden rounded-3xl border-border bg-card p-8 md:flex-row md:items-center md:justify-between md:gap-12 md:p-12",
        className,
      )}
    >
      <div className="flex flex-col gap-4 text-center md:text-left">
        <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">
          {profile.name}
        </h1>
        <p className="max-w-xl text-base text-muted-foreground md:text-lg">
          {profile.role}
        </p>
        <p className="text-sm text-muted-foreground">{profile.affiliation}</p>
      </div>
      {profile.image ? (
        <div className="relative size-32 shrink-0 overflow-hidden rounded-full border border-border md:size-52">
          <Image
            src={profile.image}
            alt={profile.name}
            fill
            sizes="(min-width: 768px) 13rem, 8rem"
            className="object-cover"
            priority
          />
        </div>
      ) : null}
    </Card>
  );
}
