import { Construction } from "lucide-react";
import type { Metadata } from "next";

import { FadeIn } from "@/components/motion/fade-in";

export const metadata: Metadata = {
  title: "Works",
  description:
    "個人開発・OSS・研究・登壇など、これまでに取り組んできた Works の一覧。",
  alternates: { canonical: "/works" },
};

export default function WorksPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-32">
      <FadeIn>
        <div className="flex flex-col items-center gap-6 text-center">
          <Construction className="size-12 text-muted-foreground" />
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Works
          </h1>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground md:text-base">
            <p>
              現在、CMS
              対応に向けてこのページをリニューアル中です。しばらくお待ちください。
            </p>
            <p className="text-xs md:text-sm">
              This page is currently being rebuilt for CMS integration. Please
              check back soon.
            </p>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
