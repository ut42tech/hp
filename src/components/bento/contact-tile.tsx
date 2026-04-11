import { Github, Globe, Linkedin, Mail, Twitter } from "lucide-react";
import type { ComponentType } from "react";

import { Card } from "@/components/ui/card";
import { profile } from "@/content/profile";
import type { SocialIcon } from "@/content/types";
import { cn } from "@/lib/utils";

const iconMap: Record<SocialIcon, ComponentType<{ className?: string }>> = {
  github: Github,
  x: Twitter,
  linkedin: Linkedin,
  mail: Mail,
  other: Globe,
};

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
      <ul className="flex flex-wrap gap-2">
        {profile.social.map((link) => {
          const Icon = iconMap[link.icon];
          return (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="inline-flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Icon className="size-4" />
              </a>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
