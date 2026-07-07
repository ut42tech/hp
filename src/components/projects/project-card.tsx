import { SiGithub } from "@icons-pack/react-simple-icons";
import { Link as LinkIcon, Rocket } from "lucide-react";
import Image from "next/image";

import type { Project } from "@/content/types";

export function ProjectCard({ project }: { project: Project }) {
  const github = project.links.find((l) => l.kind === "github")?.href;
  const demo = project.links.find((l) => l.kind === "demo")?.href;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {project.thumbnail ? (
          <Image
            src={project.thumbnail}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-accent/10 via-muted to-secondary">
            <Rocket className="size-9 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute right-2 top-2 flex gap-2">
          {github ? (
            <a
              href={github}
              target="_blank"
              rel="noreferrer"
              aria-label={`${project.title} の GitHub リポジトリ`}
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
              aria-label={`${project.title} のデプロイ先`}
              className="inline-flex size-8 items-center justify-center rounded-full bg-background/85 text-foreground backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LinkIcon className="size-4" />
            </a>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-base font-bold leading-snug">{project.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.summary}
        </p>
      </div>
    </div>
  );
}
