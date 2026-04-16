import type { Metadata } from "next";

import { UnderConstruction } from "@/components/shared/under-construction";

export const metadata: Metadata = {
  title: "Gallery",
  description: "写真ギャラリー。日常や活動の様子を写真で紹介しています。",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return <UnderConstruction title="Gallery" />;
}
