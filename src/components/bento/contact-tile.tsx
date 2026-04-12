import { SocialLinks } from "@/components/shared/social-links";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ContactTileProps {
  className?: string;
}

export function ContactTile({ className }: ContactTileProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-4 rounded-3xl border-border bg-card p-6 md:p-8",
        className,
      )}
    >
      <h2 className="text-lg font-bold">Contact</h2>
      <SocialLinks />
    </Card>
  );
}
