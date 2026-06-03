import { Link as LinkIcon } from "lucide-react";
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
        "flex flex-col gap-6 rounded-3xl border-border bg-card p-8 md:flex-row md:items-center md:justify-between md:gap-12 md:p-12",
        className,
      )}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          {profile.image ? (
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-border md:size-20">
              <Image
                src={profile.image}
                alt={profile.name}
                fill
                sizes="80px"
                className="object-cover"
                priority
              />
            </div>
          ) : null}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Hello 👋
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              I&apos;m {profile.name}
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm font-bold text-accent">
            {profile.roleTags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {profile.affiliation}
            </p>
            <a
              href={profile.lab.url}
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
            >
              @ {profile.lab.name}
              <LinkIcon className="size-3" />
            </a>
            <div className="mt-1.5 flex flex-col gap-0.5 text-xs leading-snug text-muted-foreground">
              {profile.titles.map((title) => (
                <p key={title}>{title}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="border-l-2 border-accent pl-4 text-base font-semibold leading-relaxed text-foreground md:max-w-xs md:text-lg">
        {profile.motto}
      </p>
    </Card>
  );
}
