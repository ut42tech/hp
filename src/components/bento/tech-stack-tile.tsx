import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

interface TechStackTileProps {
  className?: string;
}

export function TechStackTile({ className }: TechStackTileProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-4 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <h2 className="text-lg font-bold">Tech Stack</h2>
      <ul className="flex flex-wrap gap-2">
        {profile.techStack.map((tech) => (
          <li key={tech}>
            <Badge variant="secondary" className="font-medium">
              {tech}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}
