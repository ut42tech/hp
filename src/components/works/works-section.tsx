import { Card } from "@/components/ui/card";
import { getWorks } from "@/lib/microcms";
import { cn } from "@/lib/utils";

import { WorkCard } from "./work-card";

export async function WorksSection({ className }: { className?: string }) {
  const works = await getWorks();

  return (
    <Card
      className={cn(
        "flex flex-col gap-6 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <h2 className="text-2xl font-extrabold tracking-tight">Works</h2>
      {works.length === 0 ? (
        <p className="text-sm text-muted-foreground">取り組みは準備中です。</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((work) => (
            <li key={work.slug}>
              <WorkCard work={work} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
