import { SiGithub } from "@icons-pack/react-simple-icons";
import { FlaskConical, Link as LinkIcon, Package, Rocket } from "lucide-react";
import Image from "next/image";
import type { ComponentType } from "react";

import type { Work, WorkCategory } from "@/content/types";

const categoryIcon: Partial<
  Record<WorkCategory, ComponentType<{ className?: string }>>
> = {
  project: Rocket,
  oss: Package,
  research: FlaskConical,
};

export function ProjectCard({ work }: { work: Work }) {
  const github = work.links.find((l) => l.kind === "github")?.href;
  const demo = work.links.find((l) => l.kind === "demo")?.href;
  const Icon = categoryIcon[work.category] ?? Rocket;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {work.thumbnail ? (
          <Image
            src={work.thumbnail}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-accent/10 via-muted to-secondary">
            <Icon className="size-9 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute right-2 top-2 flex gap-2">
          {github ? (
            <a
              href={github}
              target="_blank"
              rel="noreferrer"
              aria-label={`${work.title} の GitHub リポジトリ`}
              className="inline-flex size-8 items-center justify-center rounded-full bg-background/85 text-foreground backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <SiGithub className="size-4" />
            </a>
          ) : null}
          {demo ? (
            <a
              href={demo}
              target="_blank"
              rel="noreferrer"
              aria-label={`${work.title} のデプロイ先`}
              className="inline-flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground backdrop-blur transition-opacity hover:opacity-90"
            >
              <LinkIcon className="size-4" />
            </a>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-base font-bold leading-snug">{work.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {work.summary}
        </p>
      </div>
    </div>
  );
}
