import { Card } from "@/components/ui/card";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

interface AboutTileProps {
  className?: string;
}

export function AboutTile({ className }: AboutTileProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-4 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">About</h2>
      </div>
      <p className="text-xs text-muted-foreground">{profile.affiliation}</p>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-foreground md:text-base">
        {profile.bio?.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </Card>
  );
}
