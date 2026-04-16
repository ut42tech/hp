import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { getFeaturedWorks } from "@/content/works";
import { cn } from "@/lib/utils";

interface FeaturedTileProps {
  className?: string;
}

export function FeaturedTile({ className }: FeaturedTileProps) {
  const featured = getFeaturedWorks();

  return (
    <Card
      className={cn(
        "flex flex-col gap-4 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Featured Works</h2>
        <Link
          href="/works"
          className="inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          View all
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {featured.map((work) => (
          <li key={work.slug}>
            <Link
              href={`/works/${work.slug}`}
              className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {work.category}
              </p>
              <h3 className="text-base font-bold leading-snug">{work.title}</h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {work.summary}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
