import { ArrowUpRight } from "lucide-react";

import { Section } from "@/components/home/section";
import { getProjects } from "@/content/works";

/** プロジェクトを 1 作品 1 行で並べる（カードなし・divide-y）。 */
export function ProjectList() {
  const projects = getProjects();
  if (projects.length === 0) return null;

  return (
    <Section id="projects" label="Projects">
      <ul className="divide-y divide-border">
        {projects.map((project) => (
          <li key={project.slug} className="py-5 first:pt-0 last:pb-0">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="min-w-0 break-words text-base font-bold leading-snug text-foreground">
                {project.title}
              </h3>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {project.date.slice(0, 4)}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {project.summary}
            </p>
            {project.tags.length > 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {project.tags.join(" · ")}
              </p>
            ) : null}
            {project.links.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                {project.links.map((link) => (
                  <li key={`${link.kind}-${link.href}`}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 py-1 text-sm font-medium text-foreground transition-colors hover:text-accent"
                    >
                      {link.label}
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}
