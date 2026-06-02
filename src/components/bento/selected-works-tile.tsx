import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { Work } from "@/content/types";
import { getFeaturedWorks } from "@/content/works";
import { cn } from "@/lib/utils";

interface SelectedWorksTileProps {
  className?: string;
}

/** 作品の主要外部リンク（demo > github > 先頭）を返す。無ければ undefined。 */
function primaryLink(work: Work): string | undefined {
  return (
    work.links.find((l) => l.kind === "demo")?.href ??
    work.links.find((l) => l.kind === "github")?.href ??
    work.links[0]?.href
  );
}

export function SelectedWorksTile({ className }: SelectedWorksTileProps) {
  const works = getFeaturedWorks();

  return (
    <Card
      className={cn(
        "flex flex-col gap-4 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <h2 className="text-lg font-bold">Selected Works</h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => {
          const href = primaryLink(work);
          const inner = (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {work.category}
              </p>
              <h3 className="text-base font-bold leading-snug">{work.title}</h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {work.summary}
              </p>
            </>
          );

          return (
            <li key={work.slug}>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="flex items-center justify-between gap-2 text-muted-foreground">
                    <span className="sr-only">{work.title}</span>
                    <ArrowUpRight className="ml-auto size-4" />
                  </span>
                  {inner}
                </a>
              ) : (
                <div className="flex h-full flex-col gap-2 rounded-2xl border border-border bg-background p-4">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
