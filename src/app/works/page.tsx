import type { Metadata } from "next";

import { FadeIn } from "@/components/motion/fade-in";
import { WorksGrid } from "@/components/works/works-grid";
import { works } from "@/content/works";

export const metadata: Metadata = {
  title: "Works",
  description:
    "個人開発・OSS・研究・登壇など、これまでに取り組んできた Works の一覧。",
  alternates: { canonical: "/works" },
};

export default function WorksPage() {
  const sorted = [...works].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <FadeIn>
        <header className="mb-10 flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Works
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            個人開発・OSS・研究・登壇など、カテゴリごとにフィルタして一覧できます。
          </p>
        </header>
      </FadeIn>
      <FadeIn delay={0.1}>
        <WorksGrid works={sorted} />
      </FadeIn>
    </section>
  );
}
