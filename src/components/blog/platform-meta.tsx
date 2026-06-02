import { SiNote, SiQiita, SiZenn } from "@icons-pack/react-simple-icons";
import type { ComponentType } from "react";

import type { BlogPlatform } from "@/lib/blog/types";

interface PlatformMeta {
  label: string;
  /** バッジ・プレースホルダの色（ブランド準拠） */
  color: string;
  Icon: ComponentType<{ className?: string }>;
}

export const platformMeta: Record<BlogPlatform, PlatformMeta> = {
  qiita: { label: "Qiita", color: "#55C500", Icon: SiQiita },
  zenn: { label: "Zenn", color: "#3EA8FF", Icon: SiZenn },
  note: { label: "note", color: "#41C9B4", Icon: SiNote },
};
