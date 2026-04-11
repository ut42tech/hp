import {
  SiFigma,
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiPytorch,
  SiReact,
  SiTailwindcss,
  SiTypescript,
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
  React: SiReact as IconComponent,
  "Next.js": SiNextdotjs as IconComponent,
  "Tailwind CSS": SiTailwindcss as IconComponent,
  "Node.js": SiNodedotjs as IconComponent,
  Python: SiPython as IconComponent,
  PyTorch: SiPytorch as IconComponent,
  Figma: SiFigma as IconComponent,
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
