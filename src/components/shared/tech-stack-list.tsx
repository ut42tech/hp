import {
  SiApple,
  SiBlender,
  SiCinema4d,
  SiCloudflare,
  SiDocker,
  SiDotnet,
  SiFastapi,
  SiFigma,
  SiFlask,
  SiGit,
  SiGooglecloud,
  SiLatex,
  SiLinux,
  SiNextdotjs,
  SiOpenjdk,
  SiProxmox,
  SiPython,
  SiReact,
  SiSupabase,
  SiSwift,
  SiTailwindcss,
  SiThreedotjs,
  SiTypescript,
  SiTypst,
  SiUnity,
  SiVercel,
} from "@icons-pack/react-simple-icons";
import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<{ className?: string }>;

/**
 * Tech 名 → simple-icons のブランドアイコンのマッピング。
 * プロフィールに追加した技術名がここに無い場合は、アイコンなしでテキストのみ表示される。
 */
const techIconMap: Record<string, IconComponent> = {
  TypeScript: SiTypescript,
  Python: SiPython,
  "C#": SiDotnet,
  Swift: SiSwift,
  Java: SiOpenjdk,
  React: SiReact,
  "Next.js": SiNextdotjs,
  FastAPI: SiFastapi,
  Flask: SiFlask,
  "Tailwind CSS": SiTailwindcss,
  "Three.js": SiThreedotjs,
  GCP: SiGooglecloud,
  Vercel: SiVercel,
  Supabase: SiSupabase,
  Cloudflare: SiCloudflare,
  Docker: SiDocker,
  Proxmox: SiProxmox,
  Linux: SiLinux,
  Git: SiGit,
  Unity: SiUnity,
  Blender: SiBlender,
  "Cinema 4D": SiCinema4d,
  Figma: SiFigma,
  "Final Cut Pro": SiApple,
  LaTeX: SiLatex,
  Typst: SiTypst,
};

interface TechStackListProps {
  className?: string;
}

/**
 * プロフィールの技術スタックをアイコン付き Badge で列挙する共有コンポーネント。
 * Bento タイルと About ページから呼び出される。
 */
export function TechStackList({ className }: TechStackListProps) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {profile.techStack.map((tech) => {
        const Icon = techIconMap[tech];
        return (
          <li key={tech}>
            <Badge
              variant="secondary"
              className="gap-1.5 py-1 pl-2 pr-2.5 font-medium"
            >
              {Icon ? <Icon className="size-3.5" /> : null}
              {tech}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
