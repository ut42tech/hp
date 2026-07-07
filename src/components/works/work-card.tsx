import { Sparkles } from "lucide-react";
import Image from "next/image";

import type { Work } from "@/content/types";

const cardClassName =
  "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background";

function WorkCardBody({ work }: { work: Work }) {
  return (
    <>
      <div className="relative aspect-video overflow-hidden bg-muted">
        {work.thumbnail ? (
          <Image
            src={work.thumbnail}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-accent/10 via-muted to-secondary">
            <Sparkles className="size-9 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-base font-bold leading-snug">{work.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {work.summary}
        </p>
      </div>
    </>
  );
}

export function WorkCard({ work }: { work: Work }) {
  if (work.url) {
    return (
      <a
        href={work.url}
        target="_blank"
        rel="noreferrer"
        className={`${cardClassName} transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
      >
        <WorkCardBody work={work} />
      </a>
    );
  }

  return (
    <div className={cardClassName}>
      <WorkCardBody work={work} />
    </div>
  );
}
