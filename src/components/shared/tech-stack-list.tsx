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
import type { ComponentType, SVGProps } from "react";

import { Badge } from "@/components/ui/badge";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Tech 名 → simple-icons のブランドアイコンのマッピング。
 * プロフィールに追加した技術名がここに無い場合は、アイコンなしでテキストのみ表示される。
 */
const techIconMap: Record<string, IconComponent> = {
  TypeScript: SiTypescript as IconComponent,
  Python: SiPython as IconComponent,
  "C#": SiDotnet as IconComponent,
  Swift: SiSwift as IconComponent,
  Java: SiOpenjdk as IconComponent,
  React: SiReact as IconComponent,
  "Next.js": SiNextdotjs as IconComponent,
  FastAPI: SiFastapi as IconComponent,
  Flask: SiFlask as IconComponent,
  "Tailwind CSS": SiTailwindcss as IconComponent,
  "Three.js": SiThreedotjs as IconComponent,
  GCP: SiGooglecloud as IconComponent,
  Vercel: SiVercel as IconComponent,
  Supabase: SiSupabase as IconComponent,
  Cloudflare: SiCloudflare as IconComponent,
  Docker: SiDocker as IconComponent,
  Proxmox: SiProxmox as IconComponent,
  Linux: SiLinux as IconComponent,
  Git: SiGit as IconComponent,
  Unity: SiUnity as IconComponent,
  Blender: SiBlender as IconComponent,
  "Cinema 4D": SiCinema4d as IconComponent,
  Figma: SiFigma as IconComponent,
  "Final Cut Pro": SiApple as IconComponent,
  LaTeX: SiLatex as IconComponent,
  Typst: SiTypst as IconComponent,
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
