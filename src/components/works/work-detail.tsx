import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { Work } from "@/content/types";

interface WorkDetailProps {
  work: Work;
}

const linkKindLabel: Record<string, string> = {
  github: "GitHub",
  demo: "Demo",
  paper: "Paper",
  slide: "Slide",
  article: "Article",
  other: "Link",
};

export function WorkDetail({ work }: WorkDetailProps) {
  const formattedDate = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(work.date));

  return (
    <article className="flex flex-col gap-10">
      <Link
        href="/works"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
      >
        <ArrowLeft className="size-4" />
        Works 一覧に戻る
      </Link>

      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {work.category}
          </p>
          <span aria-hidden className="text-muted-foreground">
            ·
          </span>
          <time dateTime={work.date} className="text-xs text-muted-foreground">
            {formattedDate}
          </time>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          {work.title}
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
          {work.summary}
        </p>
        {work.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {work.tags.map((tag) => (
              <li key={tag}>
                <Badge variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </header>

      {work.body && work.body.length > 0 && (
        <div className="flex max-w-2xl flex-col gap-4 text-base leading-relaxed">
          {work.body.map((paragraph, index) => (
            <p key={`${work.slug}-p-${index}`}>{paragraph}</p>
          ))}
        </div>
      )}

      {work.links.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Links
          </h2>
          <ul className="flex flex-col gap-2">
            {work.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {linkKindLabel[link.kind] ?? "Link"}
                  </span>
                  <span>{link.label}</span>
                  <ArrowUpRight className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
