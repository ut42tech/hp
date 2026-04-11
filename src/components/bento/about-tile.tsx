import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

interface AboutTileProps {
  className?: string;
}

export function AboutTile({ className }: AboutTileProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-4 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">About</h2>
        <Link
          href="/about"
          className="inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Read more
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <p className="text-xs text-muted-foreground">{profile.affiliation}</p>
      <p className="text-sm leading-relaxed text-foreground md:text-base">
        {profile.bio}
      </p>
    </Card>
  );
}
