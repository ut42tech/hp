import { TechStackList } from "@/components/shared/tech-stack-list";
import { Card } from "@/components/ui/card";
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
      <TechStackList />
    </Card>
  );
}
