import { Card } from "@/components/ui/card";
import { getProjects } from "@/lib/microcms";
import { cn } from "@/lib/utils";

import { ProjectCard } from "./project-card";

export async function ProjectsSection({ className }: { className?: string }) {
  const projects = await getProjects();

  return (
    <Card
      className={cn(
        "flex flex-col gap-6 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <h2 className="text-2xl font-extrabold tracking-tight">Projects</h2>
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">作品は準備中です。</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((work) => (
            <li key={work.slug}>
              <ProjectCard work={work} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
