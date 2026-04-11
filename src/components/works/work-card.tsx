import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Work } from "@/content/types";
import { cn } from "@/lib/utils";

interface WorkCardProps {
  work: Work;
  className?: string;
}

export function WorkCard({ work, className }: WorkCardProps) {
  return (
    <Card
      className={cn(
        "group flex flex-col gap-4 rounded-3xl border-border bg-card p-6 transition-colors hover:bg-muted",
        className,
      )}
    >
      <Link
        href={`/works/${work.slug}`}
        className="flex h-full flex-col gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {work.category}
          </p>
          <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold leading-snug">{work.title}</h3>
          <p className="text-sm text-muted-foreground">{work.summary}</p>
        </div>
        <div className="mt-auto flex flex-wrap gap-1.5">
          {work.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </Link>
    </Card>
  );
}
