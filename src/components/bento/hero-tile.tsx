import { Card } from "@/components/ui/card";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

interface HeroTileProps {
  className?: string;
}

export function HeroTile({ className }: HeroTileProps) {
  return (
    <Card
      className={cn(
        "flex flex-col justify-between gap-6 rounded-3xl border-border bg-card p-8 md:p-10",
        className,
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">Portfolio</p>
      <div>
        <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">
          {profile.name}
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
          {profile.role}
        </p>
      </div>
    </Card>
  );
}
