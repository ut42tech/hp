"use client";

import {
  SiGithub,
  SiNote,
  SiWantedly,
  SiX,
  SiYoutube,
} from "@icons-pack/react-simple-icons";
import { Globe } from "lucide-react";
import type { ComponentType } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { profile } from "@/content/profile";
import type { SocialIcon } from "@/content/types";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<{ className?: string }>;

const iconMap: Record<SocialIcon, IconComponent> = {
  x: SiX,
  github: SiGithub,
  note: SiNote,
  youtube: SiYoutube,
  wantedly: SiWantedly,
  other: Globe,
};

type SocialLinksSize = "default" | "sm";

interface SocialLinksProps {
  size?: SocialLinksSize;
  className?: string;
}

const sizeClasses: Record<SocialLinksSize, { wrapper: string; icon: string }> =
  {
    default: { wrapper: "size-10", icon: "size-4" },
    sm: { wrapper: "size-8", icon: "size-3.5" },
  };

/**
 * プロフィールのソーシャルリンク一覧を描画する共有コンポーネント。
 * Contact タイル・About ページ・Footer など複数箇所から呼び出される。
 */
export function SocialLinks({ size = "default", className }: SocialLinksProps) {
  const { wrapper, icon } = sizeClasses[size];

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {profile.social.map((link) => {
        const Icon = iconMap[link.icon];
        return (
          <li key={link.label}>
            <Tooltip>
              <TooltipTrigger
                render={(props) => (
                  <a
                    {...props}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className={cn(
                      "inline-flex items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      wrapper,
                    )}
                  >
                    <Icon className={icon} />
                  </a>
                )}
              />
              <TooltipContent>{link.label}</TooltipContent>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
}
