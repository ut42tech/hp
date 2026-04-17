import { Construction } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";

interface UnderConstructionProps {
  title: string;
}

/**
 * CMS 対応リニューアル中の仮ページ。
 * Works / Gallery など未完成ページで共通利用する。
 */
export function UnderConstruction({ title }: UnderConstructionProps) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-32">
      <FadeIn>
        <div className="flex flex-col items-center gap-6 text-center">
          <Construction className="size-12 text-muted-foreground" />
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            {title}
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
