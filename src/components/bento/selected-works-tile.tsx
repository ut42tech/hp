import {
  ArrowUpRight,
  Award,
  FlaskConical,
  Package,
  Rocket,
} from "lucide-react";
import Image from "next/image";
import type { ComponentType } from "react";

import { Card } from "@/components/ui/card";
import type { Work, WorkCategory } from "@/content/types";
import { getFeaturedWorks } from "@/content/works";
import { cn } from "@/lib/utils";

interface SelectedWorksTileProps {
  className?: string;
}

type IconComponent = ComponentType<{ className?: string }>;

/**
 * カテゴリごとのフォールバックアイコン。
 * サムネイル画像(work.thumbnail)が無い作品で、カテゴリを表す控えめなアイコンを表示する。
 */
const categoryIcon: Record<WorkCategory, IconComponent> = {
  project: Rocket,
  oss: Package,
  research: FlaskConical,
  experience: Award,
};

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
          const Icon = categoryIcon[work.category];

          // リンクの有無に関わらず構造を完全に共通化する。
          // リンク先を示す矢印はサムネイルに重ねる(absolute)ため、
          // テキストの位置がリンク有無でずれることはない。
          const inner = (
            <>
              <div className="relative aspect-video overflow-hidden bg-muted">
                {work.thumbnail ? (
                  <Image
                    src={work.thumbnail}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 240px, (min-width: 640px) 45vw, 90vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-accent/10 via-muted to-secondary">
                    <Icon className="size-9 text-muted-foreground/40" />
                  </div>
                )}
                {href ? (
                  <span className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <ArrowUpRight className="size-4" />
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <h3 className="text-base font-bold leading-snug">
                  {work.title}
                </h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {work.summary}
                </p>
              </div>
            </>
          );

          const containerClass =
            "flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background";

          return (
            <li key={work.slug}>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    containerClass,
                  )}
                >
                  {inner}
                </a>
              ) : (
                <div className={containerClass}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
