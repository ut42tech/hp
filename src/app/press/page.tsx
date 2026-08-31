import type { Metadata } from "next";

import { FadeIn } from "@/components/motion/fade-in";
import { PressCard } from "@/components/press/press-card";
import { getAllPress } from "@/lib/microcms";

export const revalidate = 3600; // MICROCMS_REVALIDATE_SECONDS と同値（route segment config は静的リテラルを要求）

export const metadata: Metadata = {
  title: "Press",
  description:
    "メディアで取り上げていただいた記事をまとめています。インタビュー・受賞・イベントの掲載記録。",
  alternates: { canonical: "/press" },
};

export default async function PressPage() {
  const items = await getAllPress();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <FadeIn>
        <header className="mb-10 flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Press
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            掲載一覧
          </h1>
          <p className="text-sm text-muted-foreground">
            メディアで取り上げていただいた記事をまとめています。
          </p>
        </header>
      </FadeIn>

      <FadeIn delay={0.05}>
        {items.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            記事はまだありません。
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.slug}>
                <PressCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </FadeIn>
    </section>
  );
}
