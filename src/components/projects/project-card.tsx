import { SiGithub } from "@icons-pack/react-simple-icons";
import type { LucideIcon } from "lucide-react";
import {
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Newspaper,
  Presentation,
  Rocket,
} from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import type { LinkKind, Project } from "@/content/types";

/** リンク種別ごとのアイコン。microCMS の links.kind セレクトと 1:1 で対応する。 */
const LINK_ICONS: Record<LinkKind, LucideIcon | typeof SiGithub> = {
  github: SiGithub,
  demo: LinkIcon,
  paper: FileText,
  slide: Presentation,
  article: Newspaper,
  other: ExternalLink,
};

/** 表示順。microCMS 側の並びに依存せず常に同じ順で出す。 */
const LINK_ORDER: LinkKind[] = [
  "github",
  "demo",
  "paper",
  "slide",
  "article",
  "other",
];

export function ProjectCard({ project }: { project: Project }) {
  const links = [...project.links].sort(
    (a, b) => LINK_ORDER.indexOf(a.kind) - LINK_ORDER.indexOf(b.kind),
  );

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
        {links.length > 0 ? (
          <div className="absolute right-2 top-2 flex gap-2">
            {links.map((link) => {
              const Icon = LINK_ICONS[link.kind];
              return (
                <a
                  key={`${link.kind}-${link.href}`}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${project.title} の ${link.label}`}
                  className="inline-flex size-8 items-center justify-center rounded-full bg-background/85 text-foreground backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="size-4" />
                </a>
              );
            })}
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-base font-bold leading-snug">{project.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.summary}
        </p>
        {project.tags.length > 0 ? (
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <li key={tag}>
                <Badge variant="secondary">{tag}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
